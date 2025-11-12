import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RFQ_MODULE } from "../../../../../modules/rfq";

// GET /store/buyers/rfq/:id - Get RFQ details with quotations
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { buyer_id } = req.query;

  if (!buyer_id) {
    return res.status(401).json({
      error: "Buyer authentication required",
    });
  }

  try {
    const rfqModuleService = req.scope.resolve(RFQ_MODULE);

    // Get RFQ
    const rfq = await rfqModuleService.retrieveRFQ(id);

    if (!rfq) {
      return res.status(404).json({
        error: "RFQ not found",
      });
    }

    // Verify ownership
    if (rfq.buyer_id !== buyer_id) {
      return res.status(403).json({
        error: "You do not have permission to view this RFQ",
      });
    }

    // Get quotations
    const quotations = await rfqModuleService.getRFQQuotations(id);

    return res.json({
      rfq,
      quotations,
    });
  } catch (error) {
    console.error("Error getting RFQ:", error);
    return res.status(500).json({
      error: "Failed to get RFQ",
    });
  }
}

// POST /store/buyers/rfq/:id/publish - Publish draft RFQ
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { buyer_id } = req.body as any;

  if (!buyer_id) {
    return res.status(401).json({
      error: "Buyer authentication required",
    });
  }

  try {
    const rfqModuleService = req.scope.resolve(RFQ_MODULE);

    // Get RFQ and verify ownership
    const rfq = await rfqModuleService.retrieveRFQ(id);

    if (rfq.buyer_id !== buyer_id) {
      return res.status(403).json({
        error: "You do not have permission to publish this RFQ",
      });
    }

    // Publish
    const published = await rfqModuleService.publishRFQ(id);

    return res.json({
      rfq: published,
      message: "RFQ published to vendors",
    });
  } catch (error) {
    console.error("Error publishing RFQ:", error);
    return res.status(500).json({
      error: "Failed to publish RFQ",
    });
  }
}

// DELETE /store/buyers/rfq/:id - Delete/close RFQ
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { buyer_id } = req.body as any;

  if (!buyer_id) {
    return res.status(401).json({
      error: "Buyer authentication required",
    });
  }

  try {
    const rfqModuleService = req.scope.resolve(RFQ_MODULE);

    // Get RFQ and verify ownership
    const rfq = await rfqModuleService.retrieveRFQ(id);

    if (rfq.buyer_id !== buyer_id) {
      return res.status(403).json({
        error: "You do not have permission to delete this RFQ",
      });
    }

    // Close RFQ
    await rfqModuleService.closeRFQ(id);

    return res.json({
      id,
      deleted: true,
      message: "RFQ closed",
    });
  } catch (error) {
    console.error("Error deleting RFQ:", error);
    return res.status(500).json({
      error: "Failed to delete RFQ",
    });
  }
}
