import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { refundEscrowWorkflow } from "../../../../../workflows/escrow/refund-escrow";

type RefundRequest = {
  resolutionNotes: string;
};

export const POST = async (
  req: AuthenticatedMedusaRequest<RefundRequest>,
  res: MedusaResponse
) => {
  const { id: escrowId } = req.params;
  const adminId = req.auth_context.actor_id;

  const { result } = await refundEscrowWorkflow(req.scope).run({
    input: {
      escrowId,
      adminId,
      resolutionNotes: req.validatedBody.resolutionNotes,
    },
  });

  res.json({
    escrow: result,
  });
};
