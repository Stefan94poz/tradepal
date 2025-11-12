import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk";
import { holdPaymentStep } from "./steps/hold-payment";
import { createEscrowRecordStep } from "./steps/create-escrow-record";

type CreateEscrowInput = {
  orderId: string;
  buyerId: string;
  vendorId: string; // Changed from sellerId
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

    // Transform payment data to extract paymentIntentId
    const paymentIntentId = transform({ payment }, (data) => {
      return data.payment.paymentIntentId || "";
    });

    // Step 2: Create escrow record
    const escrow = createEscrowRecordStep({
      orderId: input.orderId,
      buyerId: input.buyerId,
      vendorId: input.vendorId, // Changed from sellerId
      amount: input.amount,
      currency: input.currency,
      paymentIntentId: paymentIntentId as any,
    });

    return new WorkflowResponse({
      escrow,
      payment,
    });
  }
);
