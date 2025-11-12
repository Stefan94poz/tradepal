import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createRFQStep } from "./steps/create-rfq";
import { notifyVendorsStep } from "./steps/notify-vendors";

export type CreateRFQInput = {
  buyer_id: string;
  buyer_company: string;
  buyer_email: string;
  buyer_phone?: string;
  title: string;
  description: string;
  product_details: any[];
  quantity: number;
  target_price?: number;
  total_budget?: number;
  delivery_deadline?: string;
  valid_until?: string;
  special_requirements?: string;
  payment_terms?: string;
  publish?: boolean; // Auto-publish RFQ
};

/**
 * Create RFQ Workflow
 *
 * Creates a Request for Quotation and optionally publishes it to vendors
 */
export const createRFQWorkflow = createWorkflow(
  "create-rfq",
  (input: CreateRFQInput) => {
    // Step 1: Create RFQ
    const rfq = createRFQStep(input);

    // Step 2: If published, notify relevant vendors
    if (input.publish) {
      notifyVendorsStep({
        rfq_id: rfq.id,
        product_details: input.product_details,
      });
    }

    return new WorkflowResponse({
      rfq,
    });
  }
);
