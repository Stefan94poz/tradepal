import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { USER_PROFILE_MODULE } from "../../../../modules/user_profile";
import UserProfileModuleService from "../../../../modules/user_profile/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const userProfileService: UserProfileModuleService =
    req.scope.resolve(USER_PROFILE_MODULE);

  const [verifications, count] =
    await userProfileService.listAndCountVerificationDocuments({
      status: "pending",
    });

  res.json({
    verifications,
    count,
  });
};
