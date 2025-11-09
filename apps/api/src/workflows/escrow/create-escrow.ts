import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ESCROW_MODULE } from "../../modules/escrow";
import EscrowModuleService from "../../modules/escrow/service";
import Stripe from "stripe";

type CreateEscrowInput = {
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency?: string;
};

const createPaymentIntentStep = createStep(
  "create-payment-intent",
  async (input: CreateEscrowInput, { container }) => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
      apiVersion: "2025-10-29.clover",
    });

    // Create payment intent with manual capture (hold funds)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100), // Convert to cents
      currency: input.currency || "usd",
      capture_method: "manual", // Don't capture immediately - hold funds
      metadata: {
        order_id: input.orderId,
        buyer_id: input.buyerId,
        seller_id: input.sellerId,
        escrow: "true",
      },
    });

    return new StepResponse(paymentIntent, paymentIntent.id);
  },
  async (paymentIntentId, { container }) => {
    if (!paymentIntentId) return;

    // Rollback: Cancel payment intent
    const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
      apiVersion: "2025-10-29.clover",
    });

    try {
      await stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      console.error("Failed to cancel payment intent:", error);
    }
  }
);

const createEscrowRecordStep = createStep(
  "create-escrow-record",
  async (
    input: {
      paymentIntent: Stripe.PaymentIntent;
      escrowData: CreateEscrowInput;
    },
    { container }
  ) => {
    const escrowService: EscrowModuleService = container.resolve(ESCROW_MODULE);

    const escrow = await escrowService.createEscrowTransactions({
      order_id: input.escrowData.orderId,
      buyer_id: input.escrowData.buyerId,
      seller_id: input.escrowData.sellerId,
      amount: input.escrowData.amount,
      currency_code: input.escrowData.currency || "usd",
      status: "pending",
      payment_intent_id: input.paymentIntent.id,
      payment_method_id: null,
      held_at: null,
      released_at: null,
      refunded_at: null,
      disputed_at: null,
      auto_release_at: null,
    });

    return new StepResponse(escrow, escrow.id);
  },
  async (escrowId, { container }) => {
    if (!escrowId) return;

    const escrowService: EscrowModuleService = container.resolve(ESCROW_MODULE);
    await escrowService.deleteEscrowTransactions(escrowId);
  }
);

export const createEscrowWorkflow = createWorkflow(
  "create-escrow",
  (input: CreateEscrowInput) => {
    const paymentIntent = createPaymentIntentStep(input);
    const escrow = createEscrowRecordStep({
      paymentIntent,
      escrowData: input,
    });

    return new WorkflowResponse(escrow);
  }
);
