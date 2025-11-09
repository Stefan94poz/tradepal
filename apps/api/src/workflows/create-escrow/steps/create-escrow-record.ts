import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type CreateEscrowRecordStepInput = {
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
};

export const createEscrowRecordStep = createStep(
  "create-escrow-record-step",
  async (input: CreateEscrowRecordStepInput, { container }) => {
    const {
      orderId,
      buyerId,
      sellerId,
      amount,
      currency,
      paymentIntentId,
    } = input;

    const escrowModuleService = container.resolve("escrowModuleService");

    // Create escrow transaction
    const escrow = await (escrowModuleService as any).createEscrow({
      order_id: orderId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount,
      currency,
      payment_intent_id: paymentIntentId,
    });

    return new StepResponse(
      {
        id: escrow.id,
        orderId: escrow.order_id,
        status: escrow.status,
      },
      {
        escrowId: escrow.id,
      }
    );
  },
  async (compensateData, { container }) => {
    if (!compensateData) return;

    const { escrowId } = compensateData;

    // Rollback: Delete escrow record
    const escrowModuleService = container.resolve("escrowModuleService");

    await (escrowModuleService as any).deleteEscrowTransactions(escrowId);

    console.log(`[ESCROW ROLLBACK] Deleted escrow record: ${escrowId}`);
  }
);
