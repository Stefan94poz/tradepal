import { defineLink } from "@medusajs/framework/utils";
import VendorModule from "../modules/vendor";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(VendorModule.linkable.vendor, {
  linkable: ProductModule.linkable.product,
  isList: true, // One vendor has many products
});
