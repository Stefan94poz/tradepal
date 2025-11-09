import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";

type UpdateOrderStatusStepInput = {
  orderId: string;
  status: string;
};

export const updateOrderStatusStep = createStep(
  "update-order-status-step",
  async (input: UpdateOrderStatusStepInput, { container }) => {
    const { orderId, status } = input;

    const orderModuleService = container.resolve(Modules.ORDER);

    // Get current order status for compensation
    const order = await orderModuleService.retrieveOrder(orderId);
    const previousStatus = order.status;

    // Update order status
    await orderModuleService.updateOrders(orderId, {
      status: status as any, // Cast to OrderStatus enum
    });

    return new StepResponse(
      {
        orderId,
        status,
      },
      {
        orderId,
        previousStatus,
      }
    );
  },
  async (compensationData, { container }) => {
    if (!compensationData) return;

    const { orderId, previousStatus } = compensationData;
    const orderModuleService = container.resolve(Modules.ORDER);

    // Rollback to previous status
    await orderModuleService.updateOrders(orderId, {
      status: previousStatus as any,
    });
  }
);
