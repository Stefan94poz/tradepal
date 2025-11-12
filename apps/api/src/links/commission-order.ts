import { defineLink } from "@medusajs/framework/utils";
import CommissionModule from "../modules/commission";
import OrderModule from "@medusajs/medusa/order";

export default defineLink(
  CommissionModule.linkable.commission,
  OrderModule.linkable.order
);
