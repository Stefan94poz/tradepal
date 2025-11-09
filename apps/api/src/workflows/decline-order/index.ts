import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { updateOrderStatusStep } from "../accept-order/steps/update-order-status";
import { notifyBuyerOrderDeclinedStep } from "./steps/notify-buyer-order-declined";

type DeclineOrderInput = {
  orderId: string;
  sellerId: string;
  buyerId: string;
  reason: string;
};

export const declineOrderWorkflow = createWorkflow(
  "decline-order",
  (input: DeclineOrderInput) => {
    // Step 1: Update order status to canceled
    const order = updateOrderStatusStep({
      orderId: input.orderId,
      status: "canceled",
    });

    // Step 2: Notify buyer about order decline
    notifyBuyerOrderDeclinedStep({
      orderId: input.orderId,
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      reason: input.reason,
    });

    return new WorkflowResponse({
      order,
    });
  }
);
