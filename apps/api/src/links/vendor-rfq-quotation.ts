import { defineLink } from "@medusajs/framework/utils";
import RFQModule from "../modules/rfq";
import VendorModule from "../modules/vendor";

export default defineLink(
  VendorModule.linkable.vendor,
  RFQModule.linkable.rfqQuotation
);
