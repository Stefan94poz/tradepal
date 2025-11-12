import VendorModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const VENDOR_MODULE = "vendorModuleService";

export default Module(VENDOR_MODULE, {
  service: VendorModuleService,
});

export * from "./models/vendor";
export * from "./models/vendor-admin";
