import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { submitQuotationWorkflow } from "../../../../../workflows/submit-quotation";

// GET /store/vendors/rfq/:id - Get RFQ details for vendor
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { vendor_id } = req.query;

  if (!vendor_id) {
    return res.status(401).json({
      error: "Vendor authentication required",
    });
  }

  try {
    const { data } = await req.scope.resolve("query").graph({
      entity: "rfq",
      fields: [
        "*",
        "buyer_id",
        "buyer_name",
        "buyer_email",
        "product_details",
        "quantity_min",
        "quantity_max",
        "target_price",
        "target_delivery_date",
        "delivery_address",
        "special_requirements",
        "status",
        "published_at",
        "expires_at",
      ],
      filters: { id },
    });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "RFQ not found" });
    }

    const rfq = data[0];

    // Only show published RFQs to vendors
    if (rfq.status !== "published" && rfq.status !== "quoted") {
      return res.status(403).json({
        error: "RFQ is not available",
      });
    }

    return res.json({ rfq });
  } catch (error) {
    console.error("Error getting RFQ:", error);
    return res.status(500).json({
      error: "Failed to get RFQ",
    });
  }
}
