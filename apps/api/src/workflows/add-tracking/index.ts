import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { addTrackingInfoStep } from "./steps/add-tracking-info";
import { notifyTrackingAddedStep } from "./steps/notify-tracking-added";

type AddTrackingInput = {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  sellerId: string;
};

export const addTrackingWorkflow = createWorkflow(
  "add-tracking",
  (input: AddTrackingInput) => {
    // Step 1: Add tracking information
    const tracking = addTrackingInfoStep(input);

    // Step 2: Notify buyer about tracking
    notifyTrackingAddedStep({
      orderId: input.orderId,
      trackingNumber: input.trackingNumber,
      carrier: input.carrier,
      trackingId: tracking.id,
    });

    return new WorkflowResponse({
      tracking,
    });
  }
);
