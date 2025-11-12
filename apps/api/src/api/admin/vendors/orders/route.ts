import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /admin/vendors/orders
 * List orders for authenticated vendor with filters
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const remoteQuery = req.scope.resolve("remoteQuery");
  const {
    vendor_id,
    status,
    limit = 50,
    offset = 0,
    date_from,
    date_to,
  } = req.query;

  if (!vendor_id) {
    return res.status(400).json({
      message: "vendor_id is required",
    });
  }

  try {
    // Query orders linked to this vendor
    const vendorOrderLinks = await remoteQuery({
      entryPoint: "order_vendor",
      fields: [
        "order_id",
        "vendor_id",
        "order.id",
        "order.status",
        "order.display_id",
        "order.email",
        "order.currency_code",
        "order.total",
        "order.subtotal",
        "order.tax_total",
        "order.shipping_total",
        "order.created_at",
        "order.updated_at",
        "order.items.*",
        "order.shipping_address.*",
        "order.billing_address.*",
        "vendor.id",
        "vendor.name",
      ],
      variables: {
        filters: {
          vendor_id: vendor_id as string,
        },
        skip: Number(offset),
        take: Number(limit),
      },
    });

    // Filter by status if provided
    let filteredOrders = vendorOrderLinks;
    if (status) {
      filteredOrders = vendorOrderLinks.filter(
        (link: any) => link.order.status === status
      );
    }

    // Filter by date range if provided
    if (date_from || date_to) {
      filteredOrders = filteredOrders.filter((link: any) => {
        const createdAt = new Date(link.order.created_at);
        if (date_from && createdAt < new Date(date_from as string))
          return false;
        if (date_to && createdAt > new Date(date_to as string)) return false;
        return true;
      });
    }

    // Transform to include order details
    const orders = filteredOrders.map((link: any) => ({
      ...link.order,
      vendor: link.vendor,
    }));

    return res.json({
      orders,
      count: orders.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch vendor orders",
    });
  }
}
