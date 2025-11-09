import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { refundEscrowWorkflow } from "../../../../../workflows/refund-escrow";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { refundedBy, reason } = req.body as {
      refundedBy: string;
      reason: string;
    };

    if (!refundedBy || !reason) {
      return res.status(400).json({
        error: "Missing required fields: refundedBy, reason",
      });
    }

    const escrowModuleService = req.scope.resolve("escrowModuleService");

    // Get escrow by ID
    const escrow = await (escrowModuleService as any).retrieveEscrowTransaction(
      id
    );

    if (!escrow) {
      return res.status(404).json({
        error: `Escrow not found with ID ${id}`,
      });
    }

    // Verify escrow is disputed
    if (escrow.status !== "disputed") {
      return res.status(400).json({
        error: `Cannot refund escrow with status: ${escrow.status}. Escrow must be disputed first.`,
      });
    }

    // TODO: Verify refundedBy is an admin user
    // This would require integration with Medusa's user/auth module

    // Execute refund escrow workflow
    const { result } = await refundEscrowWorkflow(req.scope).run({
      input: {
        escrowId: id,
        refundedBy,
        reason,
      },
    });

    res.json({
      success: true,
      escrow: result.escrow,
      refund: result.refund,
      message: `Refund processed for escrow ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to refund escrow",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
