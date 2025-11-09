import { model } from "@medusajs/framework/utils";

const Notification = model.define("notification", {
  id: model.id().primaryKey(),
  user_id: model.text(),
  type: model.enum([
    "verification_approved",
    "verification_rejected",
    "order_created",
    "order_accepted",
    "order_declined",
    "escrow_created",
    "escrow_released",
    "escrow_disputed",
    "shipment_created",
    "shipment_delivered",
  ]),
  title: model.text(),
  message: model.text(),
  data: model.json().nullable(),
  read: model.boolean().default(false),
  email_sent: model.boolean().default(false),
  created_at: model.dateTime().default(new Date()),
  read_at: model.dateTime().nullable(),
});

export default Notification;
