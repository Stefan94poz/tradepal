import { model } from "@medusajs/framework/utils";

const ShipmentTracking = model
  .define("shipment_tracking", {
    id: model.id().primaryKey(),
    order_id: model.text().searchable(),
    carrier: model.text(),
    tracking_number: model.text(),
    status: model
      .enum(["pending", "in_transit", "delivered", "failed"])
      .default("pending"),
    current_location: model.text().nullable(),
    estimated_delivery: model.dateTime().nullable(),
    last_updated: model.dateTime(),
    tracking_events: model.json(),
  })
  .indexes([
    {
      on: ["order_id"],
      unique: true,
    },
    {
      on: ["tracking_number"],
    },
  ]);

export default ShipmentTracking;
