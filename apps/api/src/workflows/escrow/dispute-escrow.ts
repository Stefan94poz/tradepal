import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ESCROW_MODULE } from "../../modules/escrow";
import EscrowModuleService from "../../modules/escrow/service";

type DisputeEscrowInput = {
  escrowId: string;
  userId: string; // buyer_id or seller_id
  reason: string;
};

const disputeEscrowStep = createStep(
  "dispute-escrow",
  async (input: DisputeEscrowInput, { container }) => {
    const escrowService: EscrowModuleService = container.resolve(ESCROW_MODULE);

    const escrow = await escrowService.retrieveEscrowTransaction(
      input.escrowId
    );

    // Verify the user is either buyer or seller
    if (escrow.buyer_id !== input.userId && escrow.seller_id !== input.userId) {
      throw new Error("Only buyer or seller can dispute an escrow transaction");
    }

    if (escrow.status !== "held") {
      throw new Error(`Cannot dispute escrow with status: ${escrow.status}`);
    }

    // Update escrow to disputed status
    const updatedEscrow = await escrowService.updateEscrowTransactions({
      selector: {
        id: input.escrowId,
      },
      data: {
        status: "disputed",
        dispute_reason: input.reason,
        disputed_at: new Date(),
      },
    });

    // TODO: Trigger notification to admin and other party

    return new StepResponse(updatedEscrow[0], {
      escrowId: input.escrowId,
      previousStatus: "held",
    });
  },
  async (compensationData, { container }) => {
    if (!compensationData) return;

    const escrowService: EscrowModuleService = container.resolve(ESCROW_MODULE);

    // Rollback: Return to held status
    await escrowService.updateEscrowTransactions({
      selector: {
        id: compensationData.escrowId,
      },
      data: {
        status: compensationData.previousStatus,
        dispute_reason: null,
        disputed_at: null,
      },
    });
  }
);

export const disputeEscrowWorkflow = createWorkflow(
  "dispute-escrow",
  (input: DisputeEscrowInput) => {
    const disputedEscrow = disputeEscrowStep(input);
    return new WorkflowResponse(disputedEscrow);
  }
);
