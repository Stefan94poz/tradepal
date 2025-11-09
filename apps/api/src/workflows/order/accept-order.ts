import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import NotificationModuleService from "../../modules/notification/service";

type OrderAcceptInput = {
  orderId: string;
  sellerId: string;
  buyerId: string;
  estimatedFulfillmentDays?: number;
  notes?: string;
};

const acceptOrderStep = createStep(
  "accept-order",
  async (input: OrderAcceptInput, { container }) => {
    // TODO: Update order with custom metadata
    // For now, we'll use a simple object to track acceptance
    const orderMetadata = {
      seller_accepted: true,
      seller_id: input.sellerId,
      accepted_at: new Date().toISOString(),
      estimated_fulfillment_days: input.estimatedFulfillmentDays,
      seller_notes: input.notes,
    };

    // TODO: Integrate with Medusa order service to update metadata
    // const orderService = container.resolve("orderService")
    // await orderService.update(input.orderId, { metadata: orderMetadata })

    return new StepResponse(orderMetadata, input.orderId);
  },
  async (orderId, { container }) => {
    if (!orderId) return;

    // Rollback: Mark order as pending seller acceptance again
    // TODO: Reset order metadata
  }
);

const notifyBuyerStep = createStep(
  "notify-buyer-order-accepted",
  async (input: { orderId: string; buyerId: string }, { container }) => {
    const notificationService: NotificationModuleService = container.resolve(
      "notificationModuleService"
    );

    await notificationService.createNotification({
      user_id: input.buyerId,
      type: "order_accepted",
      title: "Order Accepted",
      message: `Your order #${input.orderId} has been accepted by the seller.`,
      data: { order_id: input.orderId },
      send_email: true,
    });

    return new StepResponse({ notified: true });
  }
);

export const acceptOrderWorkflow = createWorkflow(
  "accept-order",
  (input: OrderAcceptInput) => {
    const result = acceptOrderStep(input);
    notifyBuyerStep({ orderId: input.orderId, buyerId: input.buyerId });

    return new WorkflowResponse(result);
  }
);
