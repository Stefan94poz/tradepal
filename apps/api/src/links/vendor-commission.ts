import { defineLink } from "@medusajs/framework/utils";
import CommissionModule from "../modules/commission";
import VendorModule from "../modules/vendor";

export default defineLink(
  VendorModule.linkable.vendor,
  CommissionModule.linkable.commission
);
