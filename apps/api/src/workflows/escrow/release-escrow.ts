import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ESCROW_MODULE } from "../../modules/escrow";
import EscrowModuleService from "../../modules/escrow/service";
import NotificationModuleService from "../../modules/notification/service";
import Stripe from "stripe";

type ReleaseEscrowInput = {
  escrowId: string;
  buyerId: string;
  orderId: string;
  sellerId: string;
};

const validateBuyerStep = createStep(
  "validate-buyer",
  async (input: ReleaseEscrowInput, { container }) => {
    const escrowService: EscrowModuleService = container.resolve(ESCROW_MODULE);
    const escrow = await escrowService.retrieveEscrowTransaction(
      input.escrowId
    );

    if (escrow.buyer_id !== input.buyerId) {
      throw new Error("Only the buyer can release escrow funds");
    }

    if (escrow.status !== "held") {
      throw new Error(
        `Escrow must be in 'held' status, current status: ${escrow.status}`
      );
    }

    return new StepResponse(escrow);
  }
);

const capturePaymentStep = createStep(
  "capture-payment",
  async (input: { paymentIntentId: string }, { container }) => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
      apiVersion: "2025-10-29.clover",
    });

    // Capture the held payment (release funds to seller)
    const paymentIntent = await stripe.paymentIntents.capture(
      input.paymentIntentId
    );

    return new StepResponse(paymentIntent, paymentIntent.id);
  },
  async (paymentIntentId, { container }) => {
    // Compensation: Refund if capture was successful but later steps fail
    if (!paymentIntentId) return;

    const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
      apiVersion: "2025-10-29.clover",
    });

    try {
      await stripe.refunds.create({ payment_intent: paymentIntentId });
    } catch (error) {
      console.error("Failed to refund payment:", error);
    }
  }
);

const updateEscrowStatusStep = createStep(
  "update-escrow-status",
  async (input: { escrowId: string }, { container }) => {
    const escrowService: EscrowModuleService = container.resolve(ESCROW_MODULE);

    const escrow = await escrowService.updateEscrowTransactions({
      selector: { id: input.escrowId },
      data: {
        status: "released",
        released_at: new Date(),
      },
    });

    return new StepResponse(escrow[0], input.escrowId);
  },
  async (escrowId, { container }) => {
    if (!escrowId) return;

    const escrowService: EscrowModuleService = container.resolve(ESCROW_MODULE);
    await escrowService.updateEscrowTransactions({
      selector: { id: escrowId },
      data: {
        status: "held",
        released_at: null,
      },
    });
  }
);

const notifyPartiesStep = createStep(
  "notify-parties-escrow-released",
  async (input: { sellerId: string; orderId: string }, { container }) => {
    const notificationService: NotificationModuleService = container.resolve(
      "notificationModuleService"
    );

    // Notify seller
    await notificationService.createNotification({
      user_id: input.sellerId,
      type: "escrow_released",
      title: "Payment Released",
      message: `Payment for order #${input.orderId} has been released from escrow.`,
      data: { order_id: input.orderId },
      send_email: true,
    });

    return new StepResponse({ notified: true });
  }
);

export const releaseEscrowWorkflow = createWorkflow(
  "release-escrow",
  (input: ReleaseEscrowInput) => {
    const escrow = validateBuyerStep(input);
    capturePaymentStep({ paymentIntentId: escrow.payment_intent_id });
    updateEscrowStatusStep({ escrowId: input.escrowId });
    notifyPartiesStep({ sellerId: input.sellerId, orderId: input.orderId });

    return new WorkflowResponse(escrow);
  }
);
