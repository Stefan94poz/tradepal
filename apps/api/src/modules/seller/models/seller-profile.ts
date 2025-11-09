import { model } from "@medusajs/framework/utils"

const SellerProfile = model.define("seller_profile", {
  id: model.id().primaryKey(),
  user_id: model.text().searchable(),
  company_name: model.text().searchable(),
  business_type: model.text(),
  description: model.text(),
  country: model.text(),
  city: model.text(),
  address: model.text(),
  certifications: model.array(),
  verification_status: model.enum(['pending', 'verified', 'rejected']).default('pending'),
  verification_documents: model.array(),
  is_seller: model.boolean().default(true),
})

export default SellerProfile
