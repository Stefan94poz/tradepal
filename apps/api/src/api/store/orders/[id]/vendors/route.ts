import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /store/orders/:id/vendors
 * Get multi-vendor breakdown for a buyer's order
 * Shows which vendors are fulfilling which items
 */
export async function GET(
  req: MedusaRequest<{ id: string }>,
  res: MedusaResponse
) {
  const remoteQuery = req.scope.resolve("remoteQuery");
  const orderId = req.params.id;

  try {
    // Get the main order
    const orders = await remoteQuery({
      entryPoint: "order",
      fields: [
        "id",
        "display_id",
        "status",
        "email",
        "total",
        "subtotal",
        "tax_total",
        "shipping_total",
        "currency_code",
        "created_at",
        "updated_at",
        "items.*",
        "items.product_id",
        "shipping_address.*",
        "billing_address.*",
      ],
      variables: {
        filters: {
          id: orderId,
        },
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: `Order ${orderId} not found`,
      });
    }

    const order = orders[0];

    // Group order items by vendor
    const vendorBreakdown = new Map<
      string,
      {
        vendor_id: string;
        vendor_name: string;
        items: any[];
        subtotal: number;
        status: string;
      }
    >();

    for (const item of order.items) {
      // Get vendor for this product
      const productVendorLinks = await remoteQuery({
        entryPoint: "product_vendor",
        fields: [
          "product_id",
          "vendor_id",
          "vendor.id",
          "vendor.name",
          "vendor.handle",
        ],
        variables: {
          filters: {
            product_id: item.product_id,
          },
        },
      });

      if (productVendorLinks && productVendorLinks.length > 0) {
        const vendor = productVendorLinks[0].vendor;
        const vendorId = vendor.id;

        const existing = vendorBreakdown.get(vendorId) || {
          vendor_id: vendorId,
          vendor_name: vendor.name,
          items: [],
          subtotal: 0,
          status: "pending",
        };

        existing.items.push(item);
        existing.subtotal += item.total || 0;

        vendorBreakdown.set(vendorId, existing);
      }
    }

    // Get shipment tracking for the order (aggregated from all vendors)
    let shipments: any[] = [];
    try {
      const shipmentData = await remoteQuery({
        entryPoint: "shipment",
        fields: [
          "id",
          "order_id",
          "tracking_number",
          "carrier",
          "status",
          "shipped_at",
          "delivered_at",
        ],
        variables: {
          filters: {
            order_id: orderId,
          },
        },
      });
      shipments = shipmentData || [];
    } catch (error) {
      // Shipments may not exist yet
      shipments = [];
    }

    return res.json({
      order: {
        id: order.id,
        display_id: order.display_id,
        status: order.status,
        email: order.email,
        total: order.total,
        subtotal: order.subtotal,
        tax_total: order.tax_total,
        shipping_total: order.shipping_total,
        currency_code: order.currency_code,
        created_at: order.created_at,
        updated_at: order.updated_at,
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
      },
      vendor_breakdown: Array.from(vendorBreakdown.values()),
      total_vendors: vendorBreakdown.size,
      shipments: shipments,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch order vendor breakdown",
    });
  }
}
