import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk";
import { completeOrderWorkflow } from "@medusajs/medusa/core-flows";
import { releaseEscrowWorkflow } from "../release-escrow";

type CompleteOrderWithEscrowInput = {
  orderId: string;
  escrowId: string;
  releasedBy?: string;
};

export const completeOrderWithEscrowWorkflow = createWorkflow(
  "complete-order-with-escrow",
  (input: CompleteOrderWithEscrowInput) => {
    // Step 1: Release escrow (capture payment)
    const escrow = releaseEscrowWorkflow.runAsStep({
      input: {
        escrowId: input.escrowId,
        releasedBy: input.releasedBy || "buyer", // Buyer confirms delivery
      },
    });

    // Step 2: Complete the order using Medusa's built-in workflow
    const orderIds = transform({ orderId: input.orderId }, (data) => [
      data.orderId,
    ]);

    const order = completeOrderWorkflow.runAsStep({
      input: {
        orderIds,
      },
    });

    return new WorkflowResponse({
      order,
      escrow,
    });
  }
);
