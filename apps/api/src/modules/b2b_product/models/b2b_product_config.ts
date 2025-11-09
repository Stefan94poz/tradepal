import { model } from "@medusajs/framework/utils";

const B2BProductConfig = model.define("b2b_product_config", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  minimum_order_quantity: model.number().default(1),
  lead_time_days: model.number().nullable(),
  bulk_pricing_tiers: model.json().nullable(), // { quantity: number, price: number }[]
  is_b2b_only: model.boolean().default(false),
  moq_unit: model.text().nullable(), // e.g., "pieces", "cartons", "pallets"
  availability_status: model
    .enum(["in_stock", "made_to_order", "out_of_stock", "discontinued"])
    .default("in_stock"),
});

export default B2BProductConfig;
