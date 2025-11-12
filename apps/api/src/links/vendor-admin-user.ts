import { defineLink } from "@medusajs/framework/utils";
import VendorModule from "../modules/vendor";
import UserModule from "@medusajs/medusa/user";

export default defineLink(
  VendorModule.linkable.vendorAdmin,
  UserModule.linkable.user
);
