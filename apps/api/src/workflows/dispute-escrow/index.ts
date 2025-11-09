import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { updateEscrowStatusStep } from "../release-escrow/steps/update-escrow-status";
import { notifyAdminDisputeStep } from "./steps/notify-admin-dispute";

type DisputeEscrowInput = {
  escrowId: string;
  disputedBy: string;
  reason: string;
};

export const disputeEscrowWorkflow = createWorkflow(
  "dispute-escrow",
  (input: DisputeEscrowInput) => {
    // Step 1: Update escrow status to disputed
    const escrow = updateEscrowStatusStep({
      escrowId: input.escrowId,
      status: "disputed",
      updatedBy: input.disputedBy,
    });

    // Step 2: Notify admin about dispute
    notifyAdminDisputeStep({
      escrowId: input.escrowId,
      disputedBy: input.disputedBy,
      reason: input.reason,
      orderId: escrow.id,
    });

    return new WorkflowResponse({
      escrow,
    });
  }
);
