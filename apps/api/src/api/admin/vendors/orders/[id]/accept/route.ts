import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { acceptOrderWorkflow } from "../../../../../../workflows/accept-order";

/**
 * POST /admin/vendors/orders/:id/accept
 * Accept a vendor order and create escrow
 */
export async function POST(
  req: MedusaRequest<{ id: string }>,
  res: MedusaResponse
) {
  const orderId = req.params.id;
  const body = req.body as unknown as {
    vendor_id: string;
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
      fields: [
        "order_id",
        "vendor_id",
        "order.id",
        "order.email",
        "order.total",
        "order.currency_code",
        "order.customer_id",
      ],
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

    // Execute accept-order workflow
    const { result } = await acceptOrderWorkflow(req.scope).run({
      input: {
        orderId: orderId,
        sellerId: body.vendor_id,
        buyerId: orderData.customer_id || orderData.email,
        amount: orderData.total,
        currency: orderData.currency_code,
      },
    });

    return res.json({
      order: result.order,
      escrow: result.escrow,
      message: "Order accepted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to accept order",
    });
  }
}
