import { model } from "@medusajs/framework/utils";

const Commission = model.define("commission", {
  id: model.id().primaryKey(),
  vendor_id: model.text(),
  order_id: model.text(),
  line_item_id: model.text().nullable(), // For item-level commission tracking

  // Financial details
  order_total: model.number(), // Total order amount (or line item amount)
  commission_rate: model.number(), // Percentage rate applied
  commission_amount: model.number(), // Calculated commission
  platform_fee: model.number().default(0), // Platform processing fee
  net_amount: model.number(), // Amount to be paid to vendor (commission - fees)

  // Currency
  currency_code: model.text().default("usd"),

  // Status tracking
  status: model
    .enum(["pending", "processing", "paid", "failed", "refunded"])
    .default("pending"),

  // Payment tracking
  payout_id: model.text().nullable(), // Stripe payout ID
  paid_at: model.dateTime().nullable(),

  // Metadata
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
});

export default Commission;
