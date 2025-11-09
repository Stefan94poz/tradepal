import { model } from "@medusajs/framework/utils";

export const ShipmentTracking = model.define("shipment_tracking", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  carrier: model.text(),
  tracking_number: model.text(),
  status: model
    .enum([
      "pending",
      "picked_up",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "failed",
      "returned",
    ])
    .default("pending"),
  tracking_events: model.json().nullable(),
  estimated_delivery: model.dateTime().nullable(),
  actual_delivery: model.dateTime().nullable(),
  shipped_at: model.dateTime().nullable(),
  last_updated: model.dateTime(),
  tracking_url: model.text().nullable(),
  notes: model.text().nullable(),
});
