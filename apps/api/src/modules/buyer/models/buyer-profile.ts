import { model } from "@medusajs/framework/utils";

const BuyerProfile = model.define("buyer_profile", {
  id: model.id().primaryKey(),
  user_id: model.text().searchable(),
  company_name: model.text().searchable(),
  business_interests: model.array(),
  business_needs: model.text(),
  country: model.text(),
  city: model.text(),
  address: model.text(),
  verification_status: model
    .enum(["pending", "verified", "rejected"])
    .default("pending"),
  verification_documents: model.array(),
  is_buyer: model.boolean().default(true),
});

export default BuyerProfile;
