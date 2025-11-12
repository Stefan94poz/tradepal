import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createRFQWorkflow } from "../../../../workflows/create-rfq";
import { RFQ_MODULE } from "../../../../modules/rfq";

// POST /store/buyers/rfq - Create new RFQ
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { buyer_id, ...rfqData } = req.body as any;

  // TODO: Get buyer_id from authenticated session
  if (!buyer_id) {
    return res.status(401).json({
      error: "Buyer authentication required",
    });
  }

  // Validate required fields
  if (
    !rfqData.title ||
    !rfqData.description ||
    !rfqData.product_details ||
    !rfqData.quantity
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: title, description, product_details, quantity",
    });
  }

  try {
    const { result } = await createRFQWorkflow(req.scope).run({
      input: {
        buyer_id,
        ...rfqData,
      },
    });

    return res.status(201).json({
      rfq: result.rfq,
      message: rfqData.publish
        ? "RFQ created and published to vendors"
        : "RFQ created as draft",
    });
  } catch (error) {
    console.error("Error creating RFQ:", error);
    return res.status(500).json({
      error: "Failed to create RFQ",
    });
  }
}

// GET /store/buyers/rfq - List buyer's RFQs
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { buyer_id, status } = req.query;

  if (!buyer_id) {
    return res.status(401).json({
      error: "Buyer authentication required",
    });
  }

  try {
    const rfqModuleService = req.scope.resolve(RFQ_MODULE);

    const rfqs = await rfqModuleService.getBuyerRFQs(
      buyer_id as string,
      status ? { status } : {}
    );

    return res.json({
      rfqs,
      count: rfqs.length,
    });
  } catch (error) {
    console.error("Error listing RFQs:", error);
    return res.status(500).json({
      error: "Failed to list RFQs",
    });
  }
}
