import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type UpdateEscrowStatusStepInput = {
  escrowId: string;
  status: "held" | "released" | "disputed" | "refunded" | "partially_released";
  updatedBy: string;
};

export const updateEscrowStatusStep = createStep(
  "update-escrow-status-step",
  async (input: UpdateEscrowStatusStepInput, { container }) => {
    const { escrowId, status, updatedBy } = input;

    const escrowModuleService = container.resolve("escrowModuleService");

    // Get current escrow details
    const escrow = await (escrowModuleService as any).retrieveEscrowTransaction(
      escrowId
    );

    if (!escrow) {
      throw new Error(`Escrow transaction ${escrowId} not found`);
    }

    // Update escrow status
    const updatedEscrow = await (
      escrowModuleService as any
    ).updateEscrowTransactions({
      id: escrowId,
      status,
    });

    return new StepResponse(
      {
        id: updatedEscrow.id,
        status: updatedEscrow.status,
        paymentIntentId: updatedEscrow.payment_intent_id,
        vendorId: updatedEscrow.vendor_id, // Changed from seller_id
        amount: updatedEscrow.amount,
        currency: updatedEscrow.currency,
      },
      {
        escrowId: updatedEscrow.id,
        previousStatus: escrow.status,
      }
    );
  },
  async (compensateData, { container }) => {
    if (!compensateData) return;

    const { escrowId, previousStatus } = compensateData;

    // Rollback: Restore previous status
    const escrowModuleService = container.resolve("escrowModuleService");

    await (escrowModuleService as any).updateEscrowTransactions({
      id: escrowId,
      status: previousStatus,
    });

    console.log(
      `[ESCROW ROLLBACK] Restored escrow ${escrowId} status to ${previousStatus}`
    );
  }
);
