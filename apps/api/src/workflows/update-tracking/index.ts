import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { updateTrackingStatusStep } from "./steps/update-tracking-status";

type UpdateTrackingInput = {
  trackingId: string;
  status:
    | "pending"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed";
  currentLocation?: string;
  estimatedDelivery?: string;
  eventDescription?: string;
};

export const updateTrackingWorkflow = createWorkflow(
  "update-tracking",
  (input: UpdateTrackingInput) => {
    // Step 1: Update tracking status
    const tracking = updateTrackingStatusStep(input);

    return new WorkflowResponse({
      tracking,
    });
  }
);
