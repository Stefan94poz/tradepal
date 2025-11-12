import { model } from "@medusajs/framework/utils";

const BuyerProfile = model.define("buyer_profile", {
  id: model.id().primaryKey(),
  user_id: model.text().searchable(),
  company_name: model.text().searchable(),
  business_type: model.text().nullable(), // B2B, B2C, Retailer, Distributor, etc.
  phone: model.text().nullable(),
  email: model.text().nullable(),
  business_interests: model.array(),
  business_needs: model.text(),
  country: model.text(),
  city: model.text(),
  address: model.text(),
  verification_status: model
    .enum(["pending", "basic", "verified", "premium", "rejected"])
    .default("pending"),
  verification_documents: model.array(),
  purchase_history_count: model.number().default(0), // Track order count
  is_buyer: model.boolean().default(true),
});

export default BuyerProfile;
