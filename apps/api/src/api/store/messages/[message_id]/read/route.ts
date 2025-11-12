import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MESSAGING_MODULE } from "../../../../../modules/messaging";
import MessagingService from "../../../../../modules/messaging/service";

/**
 * PUT /store/messages/[message_id]/read
 * Mark a message as read
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const { message_id } = req.params;

  try {
    const messagingService: MessagingService = req.scope.resolve(
      MESSAGING_MODULE
    );

    const message = await messagingService.markAsRead(message_id);

    return res.status(200).json({
      message,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to mark message as read",
      error: error.message,
    });
  }
}
