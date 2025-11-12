import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MESSAGING_MODULE } from "../../../../modules/messaging";
import MessagingService from "../../../../modules/messaging/service";

/**
 * GET /store/messages/conversations
 * List all conversations for the authenticated buyer
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // TODO: Get authenticated buyer ID from session/token
  const buyer_id = "buyer_123"; // Placeholder

  const { limit = 20, offset = 0 } = req.query as {
    limit?: number;
    offset?: number;
  };

  try {
    const messagingService: MessagingService = req.scope.resolve(
      MESSAGING_MODULE
    );

    const conversations = await messagingService.getConversations(
      buyer_id,
      "buyer",
      {
        limit: Number(limit),
        offset: Number(offset),
      }
    );

    return res.status(200).json({
      conversations,
      count: conversations.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to retrieve conversations",
      error: error.message,
    });
  }
}
