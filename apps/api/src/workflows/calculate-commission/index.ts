import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { calculateOrderCommissionsStep } from "./steps/calculate-order-commissions";
import { createCommissionRecordsStep } from "./steps/create-commission-records";

export type CalculateCommissionInput = {
  order_id: string;
};

/**
 * Calculate and record commissions for an order
 *
 * This workflow:
 * 1. Gets the order and splits it by vendor
 * 2. Calculates commission for each vendor based on their items
 * 3. Creates commission records
 */
export const calculateOrderCommissionsWorkflow = createWorkflow(
  "calculate-order-commissions",
  (input: CalculateCommissionInput) => {
    // Step 1: Calculate commissions for each vendor in the order
    const commissionData = calculateOrderCommissionsStep(input);

    // Step 2: Create commission records
    const commissions = createCommissionRecordsStep(commissionData);

    return new WorkflowResponse({
      commissions,
    });
  }
);
