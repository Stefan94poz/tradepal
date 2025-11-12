import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { acceptOrderWorkflow } from "../../../../../../workflows/accept-order";
import { Modules } from "@medusajs/framework/utils";

/**
 * POST /store/seller/orders/[id]/accept
 * Seller accepts an order
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { vendorId } = req.body as {
      vendorId: string; // Changed from sellerId
    };

    if (!vendorId) {
      return res.status(400).json({
        error: "Missing required field: vendorId",
      });
    }

    // Retrieve order to get buyer and amount details
    const orderModuleService = req.scope.resolve(Modules.ORDER);
    const order = await orderModuleService.retrieveOrder(id, {
      relations: ["items", "summary"],
    });

    if (!order) {
      return res.status(404).json({
        error: `Order ${id} not found`,
      });
    }

    // TODO: Verify vendorId matches the vendor for this order
    // This would require order metadata or custom relations

    // Get order total from summary
    const amount = (order.summary as any)?.total || order.total || 0;
    const currency = order.currency_code || "usd";

    // Execute accept order workflow
    const { result } = await acceptOrderWorkflow(req.scope).run({
      input: {
        orderId: id,
        vendorId, // Changed from sellerId
        buyerId: order.customer_id || "",
        amount,
        currency,
      },
    });

    res.json({
      success: true,
      order: result.order,
      escrow: result.escrow,
      message: `Order ${id} accepted by vendor`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to accept order",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
