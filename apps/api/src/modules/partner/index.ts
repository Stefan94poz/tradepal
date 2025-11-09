import PartnerModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const PARTNER_MODULE = "partnerModuleService";

export default Module(PARTNER_MODULE, {
  service: PartnerModuleService,
});
