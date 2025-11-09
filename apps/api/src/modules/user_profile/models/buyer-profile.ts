import { model } from "@medusajs/framework/utils";

export const BuyerProfile = model.define("buyer_profile", {
  id: model.id().primaryKey(),
  user_id: model.text(),
  company_name: model.text(),
  business_interests: model.array().nullable(),
  business_needs: model.text().nullable(),
  location: model.text(),
  country: model.text(),
  verification_status: model
    .enum(["pending", "verified", "rejected"])
    .default("pending"),
  description: model.text().nullable(),
  phone: model.text().nullable(),
  email: model.text(),
  verified_at: model.dateTime().nullable(),
});
