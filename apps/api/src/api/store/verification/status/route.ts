import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { USER_PROFILE_MODULE } from "../../../../modules/user-profile";
import UserProfileModuleService from "../../../../modules/user-profile/service";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const userId = req.auth_context.actor_id;
  const userProfileService: UserProfileModuleService =
    req.scope.resolve(USER_PROFILE_MODULE);

  const verifications = await userProfileService.listVerificationDocuments({
    user_id: userId,
  });

  res.json({
    verifications,
  });
};
