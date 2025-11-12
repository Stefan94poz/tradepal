import RFQModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const RFQ_MODULE = "rfqModuleService";

export default Module(RFQ_MODULE, {
  service: RFQModuleService,
});

export * from "./models/rfq";
export * from "./models/rfq-quotation";
