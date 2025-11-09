import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params;

    const escrowModuleService = req.scope.resolve("escrowModuleService");

    // Get escrow by order ID
    const escrows = await (escrowModuleService as any).listEscrowTransactions({
      order_id: id,
    });

    if (!escrows || escrows.length === 0) {
      return res.status(404).json({
        error: `Escrow not found for order ${id}`,
      });
    }

    const escrow = escrows[0];

    res.json({
      id: escrow.id,
      orderId: escrow.order_id,
      buyerId: escrow.buyer_id,
      sellerId: escrow.seller_id,
      amount: escrow.amount,
      currency: escrow.currency,
      status: escrow.status,
      paymentIntentId: escrow.payment_intent_id,
      createdAt: escrow.created_at,
      updatedAt: escrow.updated_at,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve escrow status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
