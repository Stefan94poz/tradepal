import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { sendMessageWorkflow } from "../../../workflows/send-message";

/**
 * POST /store/messages
 * Buyer sends a message to a vendor
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

  // TODO: Get authenticated buyer ID from session/token
  const buyer_id = "buyer_123"; // Placeholder

  if (!recipient_id || !body) {
    return res.status(400).json({
      message: "recipient_id and body are required",
    });
  }

  try {
    const { result } = await sendMessageWorkflow(req.scope).run({
      input: {
        sender_id: buyer_id,
        sender_type: "buyer",
        recipient_id,
        recipient_type: "vendor",
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
