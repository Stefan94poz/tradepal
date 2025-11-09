import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { approveVerificationWorkflow } from "../../../../../workflows/verification/approve-verification";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params;
  const reviewedBy = req.auth_context.actor_id;

  const { result } = await approveVerificationWorkflow(req.scope).run({
    input: {
      verificationId: id,
      reviewedBy,
    },
  });

  res.json({
    verification: result,
  });
};
