import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { disputeEscrowWorkflow } from "../../../../../../workflows/dispute-escrow";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { disputedBy, reason } = req.body as {
      disputedBy: string;
      reason: string;
    };

    if (!disputedBy || !reason) {
      return res.status(400).json({
        error: "Missing required fields: disputedBy, reason",
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

    // Verify escrow can be disputed (must be held or released)
    if (escrow.status !== "held" && escrow.status !== "released") {
      return res.status(400).json({
        error: `Cannot dispute escrow with status: ${escrow.status}`,
      });
    }

    // TODO: Verify disputedBy is either buyer or seller for this order
    // This would require integration with Medusa's order module

    // Execute dispute escrow workflow
    const { result } = await disputeEscrowWorkflow(req.scope).run({
      input: {
        escrowId: escrow.id,
        disputedBy,
        reason,
      },
    });

    res.json({
      success: true,
      escrow: result.escrow,
      message: `Dispute flagged for order ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to dispute escrow",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
