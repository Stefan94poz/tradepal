import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { sendProductInquiryWorkflow } from "../../../../../workflows/send-product-inquiry";

/**
 * POST /store/vendors/[vendor_id]/inquiry
 * Send a product inquiry to a vendor
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { vendor_id } = req.params;
  const { product_id, quantity, message } = req.body as {
    product_id: string;
    quantity?: number;
    message: string;
  };

  // TODO: Get authenticated buyer ID from session/token
  const buyer_id = "buyer_123"; // Placeholder

  if (!product_id || !message) {
    return res.status(400).json({
      message: "product_id and message are required",
    });
  }

  try {
    const { result } = await sendProductInquiryWorkflow(req.scope).run({
      input: {
        buyer_id,
        product_id,
        quantity,
        message,
      },
    });

    return res.status(201).json({
      conversation: result.conversation,
      message: result.message,
      vendor_name: result.vendor_name,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to send product inquiry",
      error: error.message,
    });
  }
}
