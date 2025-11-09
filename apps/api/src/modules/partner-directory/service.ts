import { MedusaService } from "@medusajs/framework/utils";
import { PartnerDirectoryProfile } from "./models/partner-directory-profile";

class PartnerDirectoryModuleService extends MedusaService({
  PartnerDirectoryProfile,
}) {}

export default PartnerDirectoryModuleService;
