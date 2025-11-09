import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { USER_PROFILE_MODULE } from "../../../../../modules/user-profile";
import UserProfileModuleService from "../../../../../modules/user-profile/service";

type RejectVerificationRequest = {
  reason: string;
};

export const POST = async (
  req: AuthenticatedMedusaRequest<RejectVerificationRequest>,
  res: MedusaResponse
) => {
  const { id } = req.params;
  const reviewedBy = req.auth_context.actor_id;
  const userProfileService: UserProfileModuleService =
    req.scope.resolve(USER_PROFILE_MODULE);

  const verification = await userProfileService.updateVerificationDocuments({
    selector: {
      id,
    },
    data: {
      status: "rejected",
      reviewed_at: new Date(),
      reviewed_by: reviewedBy,
      rejection_reason: req.validatedBody.reason,
    },
  });

  res.json({
    verification: verification[0],
  });
};
