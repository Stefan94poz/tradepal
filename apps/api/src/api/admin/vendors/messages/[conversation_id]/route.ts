import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MESSAGING_MODULE } from "../../../../../modules/messaging";
import MessagingService from "../../../../../modules/messaging/service";

/**
 * GET /admin/vendors/messages/[conversation_id]
 * Get conversation history with messages for vendor
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { conversation_id } = req.params;
  const { limit = 50, offset = 0 } = req.query as {
    limit?: number;
    offset?: number;
  };

  try {
    const messagingService: MessagingService = req.scope.resolve(
      MESSAGING_MODULE
    );

    const { conversation, messages } = await messagingService.getConversation(
      conversation_id,
      {
        limit: Number(limit),
        offset: Number(offset),
      }
    );

    return res.status(200).json({
      conversation,
      messages,
      count: messages.length,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to retrieve conversation",
      error: error.message,
    });
  }
}
