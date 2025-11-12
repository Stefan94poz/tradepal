import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { submitQuotationWorkflow } from "../../../../../../workflows/submit-quotation";

// POST /store/vendors/rfq/:id/quote - Submit quotation for an RFQ
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id: rfq_id } = req.params;
  const { vendor_id } = req.query;

  if (!vendor_id) {
    return res.status(401).json({
      error: "Vendor authentication required",
    });
  }

  try {
    const {
      quoted_price,
      total_price,
      minimum_order_quantity,
      lead_time_days,
      validity_days,
      payment_terms,
      delivery_terms,
      warranty_terms,
      notes,
      attachments,
    } = req.body;

    // Validate required fields
    if (!quoted_price || !total_price || !lead_time_days) {
      return res.status(400).json({
        error:
          "Missing required fields: quoted_price, total_price, lead_time_days",
      });
    }

    // Submit quotation using workflow
    const { result } = await submitQuotationWorkflow(req.scope).run({
      input: {
        rfq_id: rfq_id as string,
        vendor_id: vendor_id as string,
        quoted_price,
        total_price,
        lead_time_days,
        minimum_order_quantity,
        validity_days,
        payment_terms,
        delivery_terms,
        warranty_terms,
        notes,
        attachments,
      },
    });

    return res.json({
      quotation: result.quotation,
      message: "Quotation submitted successfully",
    });
  } catch (error: any) {
    console.error("Error submitting quotation:", error);
    return res.status(500).json({
      error: error.message || "Failed to submit quotation",
    });
  }
}
