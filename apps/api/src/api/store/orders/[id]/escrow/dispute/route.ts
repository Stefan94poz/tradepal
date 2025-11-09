import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { disputeEscrowWorkflow } from "../../../../../../../workflows/escrow/dispute-escrow";
import { ESCROW_MODULE } from "../../../../../../../modules/escrow";
import EscrowModuleService from "../../../../../../../modules/escrow/service";

type DisputeRequest = {
  reason: string;
};

export const POST = async (
  req: AuthenticatedMedusaRequest<DisputeRequest>,
  res: MedusaResponse
) => {
  const { id: orderId } = req.params;
  const userId = req.auth_context.actor_id;

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

  const { result } = await disputeEscrowWorkflow(req.scope).run({
    input: {
      escrowId: escrow.id,
      userId,
      reason: req.validatedBody.reason,
    },
  });

  res.json({
    escrow: result,
  });
};
