import { MedusaService } from "@medusajs/framework/utils";
import { SellerProfile } from "./models/seller-profile";
import { BuyerProfile } from "./models/buyer-profile";
import { VerificationDocuments } from "./models/verification-documents";

class UserProfileModuleService extends MedusaService({
  SellerProfile,
  BuyerProfile,
  VerificationDocuments,
}) {}

export default UserProfileModuleService;
