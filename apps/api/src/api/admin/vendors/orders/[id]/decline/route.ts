import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { declineOrderWorkflow } from "../../../../../../workflows/decline-order";

/**
 * POST /admin/vendors/orders/:id/decline
 * Decline a vendor order and notify buyer
 */
export async function POST(
  req: MedusaRequest<{ id: string }>,
  res: MedusaResponse
) {
  const orderId = req.params.id;
  const body = req.body as unknown as {
    vendor_id: string;
    reason?: string;
  };

  if (!body.vendor_id) {
    return res.status(400).json({
      message: "vendor_id is required",
    });
  }

  try {
    const remoteQuery = req.scope.resolve("remoteQuery");

    // Verify this order belongs to the vendor
    const vendorOrderLinks = await remoteQuery({
      entryPoint: "order_vendor",
      fields: ["order_id", "vendor_id", "order.id", "order.customer_id"],
      variables: {
        filters: {
          order_id: orderId,
          vendor_id: body.vendor_id,
        },
      },
    });

    if (!vendorOrderLinks || vendorOrderLinks.length === 0) {
      return res.status(404).json({
        message: `Order ${orderId} not found or does not belong to vendor ${body.vendor_id}`,
      });
    }

    const orderData = vendorOrderLinks[0].order;

    // Execute decline-order workflow
    const { result } = await declineOrderWorkflow(req.scope).run({
      input: {
        orderId: orderId,
        sellerId: body.vendor_id,
        buyerId: orderData.customer_id,
        reason: body.reason || "Vendor declined the order",
      },
    });

    return res.json({
      order: result.order,
      message: "Order declined successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to decline order",
    });
  }
}
