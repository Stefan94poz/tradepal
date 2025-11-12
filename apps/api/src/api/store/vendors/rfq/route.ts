import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RFQ_MODULE } from "../../../../modules/rfq";

// GET /store/vendors/rfq - List published RFQs for vendors
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { vendor_id, limit = 20, offset = 0 } = req.query;

  if (!vendor_id) {
    return res.status(401).json({
      error: "Vendor authentication required",
    });
  }

  try {
    const rfqModuleService = req.scope.resolve(RFQ_MODULE);

    // Get published RFQs
    const rfqs = await rfqModuleService.getPublishedRFQs();

    return res.json({
      rfqs: rfqs.slice(Number(offset), Number(offset) + Number(limit)),
      count: rfqs.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error("Error listing RFQs:", error);
    return res.status(500).json({
      error: "Failed to list RFQs",
    });
  }
}
