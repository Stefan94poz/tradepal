import PartnerDirectoryModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const PARTNER_DIRECTORY_MODULE = "partnerDirectoryModuleService";

export default Module(PARTNER_DIRECTORY_MODULE, {
  service: PartnerDirectoryModuleService,
});
