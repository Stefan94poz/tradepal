import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { sendMessageWorkflow } from "../../../../workflows/send-message";
import { MESSAGING_MODULE } from "../../../../modules/messaging";
import MessagingService from "../../../../modules/messaging/service";

/**
 * POST /admin/vendors/messages
 * Vendor sends a message to a buyer
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const {
    recipient_id,
    subject,
    body,
    attachments,
    product_reference,
  } = req.body as {
    recipient_id: string;
    subject?: string;
    body: string;
    attachments?: string[];
    product_reference?: string;
  };

  // TODO: Get authenticated vendor ID from session/token
  const vendor_id = "vendor_123"; // Placeholder

  if (!recipient_id || !body) {
    return res.status(400).json({
      message: "recipient_id and body are required",
    });
  }

  try {
    const { result } = await sendMessageWorkflow(req.scope).run({
      input: {
        sender_id: vendor_id,
        sender_type: "vendor",
        recipient_id,
        recipient_type: "buyer",
        subject,
        body,
        attachments,
        product_reference,
      },
    });

    return res.status(201).json({
      conversation: result.conversation,
      message: result.message,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
}

/**
 * GET /admin/vendors/messages
 * List all conversations for the authenticated vendor
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // TODO: Get authenticated vendor ID from session/token
  const vendor_id = "vendor_123"; // Placeholder

  const { limit = 20, offset = 0 } = req.query as {
    limit?: number;
    offset?: number;
  };

  try {
    const messagingService: MessagingService = req.scope.resolve(
      MESSAGING_MODULE
    );

    const conversations = await messagingService.getConversations(
      vendor_id,
      "vendor",
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
