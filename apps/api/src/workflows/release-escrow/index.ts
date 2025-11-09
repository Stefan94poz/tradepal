import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { capturePaymentStep } from "./steps/capture-payment";
import { updateEscrowStatusStep } from "./steps/update-escrow-status";
import { notifyEscrowReleasedStep } from "./steps/notify-escrow-released";

type ReleaseEscrowInput = {
  escrowId: string;
  releasedBy: string;
};

export const releaseEscrowWorkflow = createWorkflow(
  "release-escrow",
  (input: ReleaseEscrowInput) => {
    // Step 1: Update escrow status to released
    const escrow = updateEscrowStatusStep({
      escrowId: input.escrowId,
      status: "released",
      updatedBy: input.releasedBy,
    });

    // Step 2: Capture payment
    const payment = capturePaymentStep({
      paymentIntentId: escrow.paymentIntentId,
      amount: escrow.amount,
    });

    // Step 3: Notify seller about payment release
    notifyEscrowReleasedStep({
      escrowId: input.escrowId,
      sellerId: escrow.sellerId,
      amount: escrow.amount,
      currency: escrow.currency,
    });

    return new WorkflowResponse({
      escrow,
      payment,
    });
  }
);
