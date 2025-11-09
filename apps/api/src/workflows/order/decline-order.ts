import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

type OrderDeclineInput = {
  orderId: string;
  sellerId: string;
  reason: string;
};

const declineOrderStep = createStep(
  "decline-order",
  async (input: OrderDeclineInput, { container }) => {
    // TODO: Update order metadata
    const orderMetadata = {
      seller_accepted: false,
      seller_id: input.sellerId,
      declined_at: new Date().toISOString(),
      decline_reason: input.reason,
    };

    // TODO: Integrate with Medusa order service
    // Mark order as cancelled and initiate refund if payment was captured

    return new StepResponse(orderMetadata, input.orderId);
  },
  async (orderId, { container }) => {
    if (!orderId) return;

    // Rollback: Restore order to pending state
  }
);

const refundPaymentStep = createStep(
  "refund-payment-on-decline",
  async (input: { orderId: string }) => {
    // TODO: Trigger escrow refund workflow
    // If escrow exists for this order, refund it
    console.log(`Initiating refund for declined order ${input.orderId}`);

    return new StepResponse({ refunded: true });
  },
  async () => {
    // Compensation: Recapture payment if needed
  }
);

const notifyBuyerDeclineStep = createStep(
  "notify-buyer-order-declined",
  async (input: { orderId: string; reason: string }) => {
    // TODO: Send notification to buyer about decline
    console.log(
      `Buyer notified: Order ${input.orderId} declined. Reason: ${input.reason}`
    );
    return new StepResponse({ notified: true });
  }
);

export const declineOrderWorkflow = createWorkflow(
  "decline-order",
  (input: OrderDeclineInput) => {
    const result = declineOrderStep(input);
    refundPaymentStep({ orderId: input.orderId });
    notifyBuyerDeclineStep({
      orderId: input.orderId,
      reason: input.reason,
    });

    return new WorkflowResponse(result);
  }
);
