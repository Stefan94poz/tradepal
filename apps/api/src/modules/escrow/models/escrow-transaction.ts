import { model } from "@medusajs/framework/utils";

const EscrowTransaction = model
  .define("escrow_transaction", {
    id: model.id().primaryKey(),
    order_id: model.text().searchable(),
    buyer_id: model.text(),
    vendor_id: model.text(), // Changed from seller_id to vendor_id
    amount: model.bigNumber(),
    currency: model.text(),
    status: model
      .enum(["held", "released", "disputed", "refunded", "partially_released"])
      .default("held"),
    payment_intent_id: model.text(),
    held_at: model.dateTime(),
    released_at: model.dateTime().nullable(),
    dispute_reason: model.text().nullable(),
    partial_release_enabled: model.boolean().default(false), // For multi-shipment orders
    partial_release_amount: model.bigNumber().nullable(), // Amount released in partial releases
    auto_release_days: model.number().default(14), // Auto-release after N days
    auto_release_at: model.dateTime().nullable(), // Calculated auto-release date
  })
  .indexes([
    {
      on: ["order_id"],
      unique: true,
    },
    {
      on: ["status"],
    },
  ]);

export default EscrowTransaction;
