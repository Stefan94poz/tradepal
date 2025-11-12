import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { submitQuotationStep } from "./steps/submit-quotation";
import { notifyBuyerStep } from "./steps/notify-buyer";

export type SubmitQuotationInput = {
  rfq_id: string;
  vendor_id: string;
  quoted_price: number;
  total_price: number;
  lead_time_days: number;
  minimum_order_quantity?: number;
  validity_days?: number;
  payment_terms?: string;
  delivery_terms?: string;
  warranty_terms?: string;
  notes?: string;
  attachments?: string[];
};

/**
 * Submit Quotation Workflow
 *
 * Vendor submits a quotation for an RFQ
 */
export const submitQuotationWorkflow = createWorkflow(
  "submit-quotation",
  (input: SubmitQuotationInput) => {
    // Step 1: Submit quotation
    const quotation = submitQuotationStep(input);

    // Step 2: Notify buyer of new quotation
    notifyBuyerStep({
      rfq_id: input.rfq_id,
      quotation_id: quotation.id,
      vendor_id: input.vendor_id,
    });

    return new WorkflowResponse({
      quotation,
    });
  }
);
