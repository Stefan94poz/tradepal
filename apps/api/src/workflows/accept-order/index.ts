import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { updateOrderStatusStep } from "./steps/update-order-status";
import { notifyBuyerOrderAcceptedStep } from "./steps/notify-buyer-order-accepted";
import { createEscrowWorkflow } from "../create-escrow";

type AcceptOrderInput = {
  orderId: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  currency: string;
};

export const acceptOrderWorkflow = createWorkflow(
  "accept-order",
  (input: AcceptOrderInput) => {
    // Step 1: Update order status to accepted
    const order = updateOrderStatusStep({
      orderId: input.orderId,
      status: "pending", // Set to pending payment/escrow
    });

    // Step 2: Create escrow for the order
    const escrow = createEscrowWorkflow.runAsStep({
      input: {
        orderId: input.orderId,
        buyerId: input.buyerId,
        sellerId: input.sellerId,
        amount: input.amount,
        currency: input.currency,
      },
    });

    // Step 3: Notify buyer about order acceptance
    notifyBuyerOrderAcceptedStep({
      orderId: input.orderId,
      buyerId: input.buyerId,
      sellerId: input.sellerId,
    });

    return new WorkflowResponse({
      order,
      escrow,
    });
  }
);
