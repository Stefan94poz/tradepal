import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

/**
 * GET /store/seller/orders
 * List all orders for a seller
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { sellerId } = req.query as { sellerId?: string };

    if (!sellerId) {
      return res.status(400).json({
        error: "Missing required parameter: sellerId",
      });
    }

    const orderModuleService = req.scope.resolve(Modules.ORDER);

    // TODO: Filter orders by seller
    // This requires linking orders to sellers through custom metadata or relations
    // For now, retrieve all orders (will be filtered in frontend or via metadata)
    const orders = await orderModuleService.listOrders({
      // metadata: { seller_id: sellerId } // Future enhancement
    });

    res.json({
      orders,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve orders",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
