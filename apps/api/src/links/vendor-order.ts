import { defineLink } from "@medusajs/framework/utils";
import VendorModule from "../modules/vendor";
import OrderModule from "@medusajs/medusa/order";

export default defineLink(VendorModule.linkable.vendor, {
  linkable: OrderModule.linkable.order,
  isList: true, // One vendor has many orders
});
