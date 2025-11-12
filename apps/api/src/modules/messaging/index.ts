import { Module } from "@medusajs/framework/utils";
import MessagingService from "./service";

export const MESSAGING_MODULE = "messaging";

export default Module(MESSAGING_MODULE, {
  service: MessagingService,
});

// Export linkable entities
export const linkable = {
  conversation: {
    id: "conversation_id",
    field: "conversation",
  },
  message: {
    id: "message_id",
    field: "message",
  },
};
