import { model } from "@medusajs/framework/utils";

const Vendor = model
  .define("vendor", {
    id: model.id().primaryKey(),
    handle: model.text().searchable(),
    name: model.text().searchable(),
    logo: model.text().nullable(),
    description: model.text().nullable(),
    business_type: model.text(), // manufacturer, wholesaler, supplier
    country: model.text(),
    city: model.text(),
    address: model.text(),
    phone: model.text(),
    email: model.text(),
    website: model.text().nullable(),
    certifications: model.array(), // Array of certification URLs
    industries: model.array(), // Array of industry categories
    verification_status: model
      .enum(["pending", "basic", "verified", "premium"])
      .default("pending"),
    verification_documents: model.array(), // Array of document URLs
    is_active: model.boolean().default(true),
    commission_rate: model.number().default(5), // Platform commission %
    // Stripe Connect fields
    connect_account_id: model.text().nullable(),
    connect_onboarding_complete: model.boolean().default(false),
    connect_charges_enabled: model.boolean().default(false),
    connect_payouts_enabled: model.boolean().default(false),
  })
  .indexes([
    {
      on: ["handle"],
      unique: true,
    },
    {
      on: ["email"],
      unique: true,
    },
    {
      on: ["verification_status"],
    },
    {
      on: ["is_active"],
    },
  ]);

export default Vendor;
