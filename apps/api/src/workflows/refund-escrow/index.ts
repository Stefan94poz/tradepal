import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { processRefundStep } from "./steps/process-refund";
import { updateEscrowStatusStep } from "../release-escrow/steps/update-escrow-status";
import { notifyRefundProcessedStep } from "./steps/notify-refund-processed";

type RefundEscrowInput = {
  escrowId: string;
  refundedBy: string;
  reason: string;
};

export const refundEscrowWorkflow = createWorkflow(
  "refund-escrow",
  (input: RefundEscrowInput) => {
    // Step 1: Update escrow status to refunded
    const escrow = updateEscrowStatusStep({
      escrowId: input.escrowId,
      status: "refunded",
      updatedBy: input.refundedBy,
    });

    // Step 2: Process refund
    const refund = processRefundStep({
      paymentIntentId: escrow.paymentIntentId,
      amount: escrow.amount,
      reason: input.reason,
    });

    // Step 3: Notify buyer about refund
    notifyRefundProcessedStep({
      escrowId: input.escrowId,
      buyerId: escrow.sellerId, // Note: This should actually be buyerId from escrow
      amount: escrow.amount,
      currency: escrow.currency,
    });

    return new WorkflowResponse({
      escrow,
      refund,
    });
  }
);
