import { model } from "@medusajs/framework/utils";

/**
 * Message Model
 * Represents individual messages within conversations
 */
const Message = model.define("message", {
  id: model.id().primaryKey(),
  conversation_id: model.text(),
  sender_id: model.text(),
  sender_type: model.enum(["buyer", "vendor"]),
  recipient_id: model.text(),
  recipient_type: model.enum(["buyer", "vendor"]),
  subject: model.text().nullable(),
  body: model.text(),
  attachments: model.json().nullable(), // Array of file URLs
  is_read: model.boolean().default(false),
  product_reference: model.text().nullable(), // Optional product context
  created_at: model.dateTime().default(new Date()),
});

export default Message;
