import SellerModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const SELLER_MODULE = "sellerModuleService";

export default Module(SELLER_MODULE, {
  service: SellerModuleService,
});
