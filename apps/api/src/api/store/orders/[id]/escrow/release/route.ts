import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { releaseEscrowWorkflow } from "../../../../../../workflows/release-escrow";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { releasedBy } = req.body as { releasedBy: string };

    if (!releasedBy) {
      return res.status(400).json({
        error: "Missing required field: releasedBy",
      });
    }

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

    // Verify escrow is in held status
    if (escrow.status !== "held") {
      return res.status(400).json({
        error: `Cannot release escrow with status: ${escrow.status}`,
      });
    }

    // TODO: Verify releasedBy is the buyer for this order
    // This would require integration with Medusa's order module

    // Execute release escrow workflow
    const { result } = await releaseEscrowWorkflow(req.scope).run({
      input: {
        escrowId: escrow.id,
        releasedBy,
      },
    });

    res.json({
      success: true,
      escrow: result.escrow,
      payment: result.payment,
      message: `Escrow released for order ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to release escrow",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
