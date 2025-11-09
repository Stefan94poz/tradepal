import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { submitVerificationWorkflow } from "../../../../workflows/verification/submit-verification";

type SubmitVerificationRequest = {
  profileType: "seller" | "buyer";
  documentUrls: string[];
};

export const POST = async (
  req: AuthenticatedMedusaRequest<SubmitVerificationRequest>,
  res: MedusaResponse
) => {
  const userId = req.auth_context.actor_id;

  const { result } = await submitVerificationWorkflow(req.scope).run({
    input: {
      userId,
      profileType: req.validatedBody.profileType,
      documentUrls: req.validatedBody.documentUrls,
    },
  });

  res.json({
    verification: result,
  });
};
