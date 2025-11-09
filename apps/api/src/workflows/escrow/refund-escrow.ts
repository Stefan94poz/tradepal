import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ESCROW_MODULE } from "../../modules/escrow";
import EscrowModuleService from "../../modules/escrow/service";

type RefundEscrowInput = {
  escrowId: string;
  adminId: string;
  resolutionNotes: string;
};

const refundEscrowStep = createStep(
  "refund-escrow",
  async (input: RefundEscrowInput, { container }) => {
    const escrowService: EscrowModuleService = container.resolve(ESCROW_MODULE);

    const escrow = await escrowService.retrieveEscrowTransaction(
      input.escrowId
    );

    if (!["held", "disputed"].includes(escrow.status)) {
      throw new Error(`Cannot refund escrow with status: ${escrow.status}`);
    }

    // Update escrow to refunded status
    const updatedEscrow = await escrowService.updateEscrowTransactions({
      selector: {
        id: input.escrowId,
      },
      data: {
        status: "refunded",
        refunded_at: new Date(),
        resolved_at: new Date(),
        resolution_notes: input.resolutionNotes,
      },
    });

    // TODO: Process refund via Stripe
    // This would use Stripe Refund API to return funds to buyer

    return new StepResponse(updatedEscrow[0], {
      escrowId: input.escrowId,
      previousStatus: escrow.status,
    });
  },
  async (compensationData, { container }) => {
    if (!compensationData) return;

    const escrowService: EscrowModuleService = container.resolve(ESCROW_MODULE);

    // Rollback: Return to previous status
    await escrowService.updateEscrowTransactions({
      selector: {
        id: compensationData.escrowId,
      },
      data: {
        status: compensationData.previousStatus,
        refunded_at: null,
        resolved_at: null,
        resolution_notes: null,
      },
    });

    // TODO: Reverse the Stripe refund if it was processed
  }
);

export const refundEscrowWorkflow = createWorkflow(
  "refund-escrow",
  (input: RefundEscrowInput) => {
    const refundedEscrow = refundEscrowStep(input);
    return new WorkflowResponse(refundedEscrow);
  }
);
