import { model } from "@medusajs/framework/utils";

/**
 * Conversation Model
 * Represents a conversation thread between buyer and vendor
 */
const Conversation = model.define("conversation", {
  id: model.id().primaryKey(),
  participant_one_id: model.text(),
  participant_one_type: model.enum(["buyer", "vendor"]),
  participant_two_id: model.text(),
  participant_two_type: model.enum(["buyer", "vendor"]),
  product_reference: model.text().nullable(), // Optional product context
  last_message_at: model.dateTime().nullable(),
});

export default Conversation;
