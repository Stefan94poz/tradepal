import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { declineOrderWorkflow } from "../../../../../../workflows/decline-order";
import { Modules } from "@medusajs/framework/utils";

/**
 * POST /store/seller/orders/[id]/decline
 * Seller declines an order
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { sellerId, reason } = req.body as {
      sellerId: string;
      reason: string;
    };

    if (!sellerId || !reason) {
      return res.status(400).json({
        error: "Missing required fields: sellerId, reason",
      });
    }

    // Retrieve order to get buyer details
    const orderModuleService = req.scope.resolve(Modules.ORDER);
    const order = await orderModuleService.retrieveOrder(id);

    if (!order) {
      return res.status(404).json({
        error: `Order ${id} not found`,
      });
    }

    // TODO: Verify sellerId matches the seller for this order

    // Execute decline order workflow
    const { result } = await declineOrderWorkflow(req.scope).run({
      input: {
        orderId: id,
        sellerId,
        buyerId: order.customer_id || "",
        reason,
      },
    });

    res.json({
      success: true,
      order: result.order,
      message: `Order ${id} declined by seller`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to decline order",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
