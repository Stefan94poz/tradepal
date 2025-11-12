import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { processVendorPayoutStep } from "./steps/process-vendor-payout";
import { updateCommissionStatusStep } from "./steps/update-commission-status";

export type ProcessCommissionPayoutInput = {
  vendor_id: string;
  commission_ids?: string[]; // Optional: specific commissions to pay
};

/**
 * Process Commission Payout Workflow
 *
 * This workflow:
 * 1. Gets pending commissions for vendor
 * 2. Creates Stripe Connect transfer to vendor's connected account
 * 3. Updates commission records to 'paid' status
 */
export const processCommissionPayoutWorkflow = createWorkflow(
  "process-commission-payout",
  (input: ProcessCommissionPayoutInput) => {
    // Step 1: Process payout via Stripe Connect
    const payoutResult = processVendorPayoutStep(input);

    // Step 2: Update commission statuses
    updateCommissionStatusStep(payoutResult);

    return new WorkflowResponse({
      payout: payoutResult,
    });
  }
);
