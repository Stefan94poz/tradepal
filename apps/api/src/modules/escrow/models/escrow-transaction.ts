import { model } from "@medusajs/framework/utils";

const EscrowTransaction = model
  .define("escrow_transaction", {
    id: model.id().primaryKey(),
    order_id: model.text().searchable(),
    buyer_id: model.text(),
    seller_id: model.text(),
    amount: model.bigNumber(),
    currency: model.text(),
    status: model
      .enum(["held", "released", "disputed", "refunded"])
      .default("held"),
    payment_intent_id: model.text(),
    held_at: model.dateTime(),
    released_at: model.dateTime().nullable(),
    dispute_reason: model.text().nullable(),
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
