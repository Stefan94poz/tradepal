import { defineLink } from "@medusajs/framework/utils";
import RFQModule from "../modules/rfq";
import BuyerModule from "../modules/buyer";

export default defineLink(
  BuyerModule.linkable.buyerProfile,
  RFQModule.linkable.rfq
);
