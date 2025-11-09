import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { releaseEscrowWorkflow } from "../../../../../../../workflows/escrow/release-escrow";
import { ESCROW_MODULE } from "../../../../../../../modules/escrow";
import EscrowModuleService from "../../../../../../../modules/escrow/service";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id: orderId } = req.params;
  const buyerId = req.auth_context.actor_id;

  const escrowService: EscrowModuleService = req.scope.resolve(ESCROW_MODULE);

  // Get escrow for this order
  const [escrows] = await escrowService.listEscrowTransactions({
    order_id: orderId,
  });

  if (escrows.length === 0) {
    return res.status(404).json({
      error: "No escrow found for this order",
    });
  }

  const escrow = escrows[0];

  const { result } = await releaseEscrowWorkflow(req.scope).run({
    input: {
      escrowId: escrow.id,
      buyerId,
    },
  });

  res.json({
    escrow: result,
  });
};
