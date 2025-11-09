import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PARTNER_DIRECTORY_MODULE } from "../../../../../modules/partner_directory";
import PartnerDirectoryModuleService from "../../../../../modules/partner_directory/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const partnerService: PartnerDirectoryModuleService = req.scope.resolve(
    PARTNER_DIRECTORY_MODULE
  );

  try {
    const profile = await partnerService.retrievePartnerDirectoryProfile(id);

    // Only return published profiles
    if (!profile.is_published) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    res.json({
      profile,
    });
  } catch (error) {
    res.status(404).json({
      error: "Profile not found",
    });
  }
};
