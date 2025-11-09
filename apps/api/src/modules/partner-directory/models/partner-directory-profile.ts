import { model } from "@medusajs/framework/utils";

export const PartnerDirectoryProfile = model.define(
  "partner_directory_profile",
  {
    id: model.id().primaryKey(),
    user_id: model.text(),
    company_name: model.text(),
    country: model.text(),
    industry: model.array(),
    looking_for: model.array(),
    offers: model.array(),
    description: model.text().nullable(),
    contact_email: model.text(),
    contact_phone: model.text().nullable(),
    website: model.text().nullable(),
    logo_url: model.text().nullable(),
    is_verified: model.boolean().default(false),
    is_published: model.boolean().default(false),
  }
);
