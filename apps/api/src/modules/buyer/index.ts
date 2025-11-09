import BuyerModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const BUYER_MODULE = "buyerModuleService"

export default Module(BUYER_MODULE, {
  service: BuyerModuleService,
})
