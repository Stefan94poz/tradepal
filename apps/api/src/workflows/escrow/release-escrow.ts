import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ESCROW_MODULE } from "../../modules/escrow";
import EscrowModuleService from "../../modules/escrow/service";
import Stripe from "stripe";

type ReleaseEscrowInput = {
  escrowId: string;
  buyerId: string;
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
      apiVersion: "2024-12-18.acacia",
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
