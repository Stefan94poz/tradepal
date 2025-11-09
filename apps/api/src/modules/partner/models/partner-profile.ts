import { model } from "@medusajs/framework/utils";

const PartnerProfile = model
  .define("partner_profile", {
    id: model.id().primaryKey(),
    user_id: model.text().searchable(),
    profile_type: model.enum(["seller", "buyer"]),
    company_name: model.text().searchable(),
    country: model.text(),
    industry: model.array(),
    looking_for: model.array(),
    offers: model.array(),
    is_verified: model.boolean().default(false),
  })
  .indexes([
    {
      on: ["country"],
    },
    {
      on: ["is_verified"],
    },
  ]);

export default PartnerProfile;
