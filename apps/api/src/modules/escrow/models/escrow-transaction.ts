import { model } from "@medusajs/framework/utils";

export const EscrowTransaction = model.define("escrow_transaction", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  buyer_id: model.text(),
  seller_id: model.text(),
  amount: model.bigNumber(),
  currency_code: model.text().default("usd"),
  status: model
    .enum(["pending", "held", "released", "refunded", "disputed", "cancelled"])
    .default("pending"),
  payment_intent_id: model.text().nullable(),
  payment_method: model.text().nullable(),
  held_at: model.dateTime().nullable(),
  released_at: model.dateTime().nullable(),
  refunded_at: model.dateTime().nullable(),
  dispute_reason: model.text().nullable(),
  disputed_at: model.dateTime().nullable(),
  resolved_at: model.dateTime().nullable(),
  resolution_notes: model.text().nullable(),
  auto_release_at: model.dateTime().nullable(),
});
