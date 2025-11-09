import { Module } from "@medusajs/framework/utils";
import B2BProductConfigService from "./service";

export const B2B_PRODUCT_MODULE = "b2b_product";

export default Module(B2B_PRODUCT_MODULE, {
  service: B2BProductConfigService,
});
