import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { holdPaymentStep } from "./steps/hold-payment";
import { createEscrowRecordStep } from "./steps/create-escrow-record";

type CreateEscrowInput = {
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
};

export const createEscrowWorkflow = createWorkflow(
  "create-escrow",
  (input: CreateEscrowInput) => {
    // Step 1: Hold payment (create payment intent)
    const payment = holdPaymentStep({
      amount: input.amount,
      currency: input.currency,
      buyerId: input.buyerId,
    });

    // Step 2: Create escrow record
    const escrow = createEscrowRecordStep({
      orderId: input.orderId,
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      amount: input.amount,
      currency: input.currency,
      paymentIntentId: payment.paymentIntentId,
    });

    return new WorkflowResponse({
      escrow,
      payment,
    });
  }
);
