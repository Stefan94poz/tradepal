import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { PARTNER_DIRECTORY_MODULE } from "../../../../modules/partner-directory";
import { USER_PROFILE_MODULE } from "../../../../modules/user-profile";
import PartnerDirectoryModuleService from "../../../../modules/partner-directory/service";
import UserProfileModuleService from "../../../../modules/user-profile/service";

type PartnerProfileRequest = {
  company_name: string;
  country: string;
  industry: string[];
  looking_for: string[];
  offers: string[];
  description?: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  logo_url?: string;
};

export const POST = async (
  req: AuthenticatedMedusaRequest<PartnerProfileRequest>,
  res: MedusaResponse
) => {
  const userId = req.auth_context.actor_id;
  const partnerService: PartnerDirectoryModuleService = req.scope.resolve(
    PARTNER_DIRECTORY_MODULE
  );
  const userProfileService: UserProfileModuleService =
    req.scope.resolve(USER_PROFILE_MODULE);

  // Check if user is verified (either seller or buyer)
  const [sellerProfiles] = await userProfileService.listSellerProfiles({
    user_id: userId,
    verification_status: "verified",
  });

  const [buyerProfiles] = await userProfileService.listBuyerProfiles({
    user_id: userId,
    verification_status: "verified",
  });

  const isVerified = sellerProfiles.length > 0 || buyerProfiles.length > 0;

  if (!isVerified) {
    return res.status(403).json({
      error: "Only verified users can create partner directory profiles",
    });
  }

  // Check if profile already exists
  const [existingProfiles] = await partnerService.listPartnerDirectoryProfiles({
    user_id: userId,
  });

  let profile;

  if (existingProfiles.length > 0) {
    // Update existing profile
    const updated = await partnerService.updatePartnerDirectoryProfiles({
      selector: {
        id: existingProfiles[0].id,
      },
      data: {
        ...req.validatedBody,
        is_verified: isVerified,
      },
    });
    profile = updated[0];
  } else {
    // Create new profile
    profile = await partnerService.createPartnerDirectoryProfiles({
      user_id: userId,
      ...req.validatedBody,
      is_verified: isVerified,
      is_published: false, // Needs manual publishing
    });
  }

  res.json({
    profile,
  });
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const userId = req.auth_context.actor_id;
  const partnerService: PartnerDirectoryModuleService = req.scope.resolve(
    PARTNER_DIRECTORY_MODULE
  );

  const [profiles] = await partnerService.listPartnerDirectoryProfiles({
    user_id: userId,
  });

  res.json({
    profile: profiles.length > 0 ? profiles[0] : null,
  });
};
