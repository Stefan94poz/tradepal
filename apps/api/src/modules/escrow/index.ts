import EscrowModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const ESCROW_MODULE = "escrowModuleService";

export default Module(ESCROW_MODULE, {
  service: EscrowModuleService,
});
