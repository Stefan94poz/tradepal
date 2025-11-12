import { model } from "@medusajs/framework/utils";

const ShipmentTracking = model
  .define("shipment_tracking", {
    id: model.id().primaryKey(),
    order_id: model.text().searchable(),
    vendor_id: model.text().nullable(), // Track which vendor's shipment this is
    carrier: model.text(),
    tracking_number: model.text(),
    status: model
      .enum(["pending", "in_transit", "delivered", "failed"])
      .default("pending"),
    current_location: model.text().nullable(),
    estimated_delivery: model.dateTime().nullable(),
    last_updated: model.dateTime(),
    tracking_events: model.json(),
    is_parent_order: model.boolean().default(false), // True if this is for a multi-vendor parent order
  })
  .indexes([
    {
      on: ["order_id"],
    },
    {
      on: ["tracking_number"],
    },
    {
      on: ["vendor_id"],
    },
  ]);

export default ShipmentTracking;
