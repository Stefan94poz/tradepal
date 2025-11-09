import { model } from "@medusajs/framework/utils";

export const SellerProfile = model.define("seller_profile", {
  id: model.id().primaryKey(),
  user_id: model.text(),
  company_name: model.text(),
  business_type: model.enum([
    "manufacturer",
    "wholesaler",
    "distributor",
    "retailer",
    "other",
  ]),
  location: model.text(),
  country: model.text(),
  certifications: model.array().nullable(),
  verification_status: model
    .enum(["pending", "verified", "rejected"])
    .default("pending"),
  description: model.text().nullable(),
  phone: model.text().nullable(),
  email: model.text(),
  website: model.text().nullable(),
  logo_url: model.text().nullable(),
  verified_at: model.dateTime().nullable(),
});
