import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { SHIPMENT_MODULE } from "../../modules/shipment";
import ShipmentModuleService from "../../modules/shipment/service";
import NotificationModuleService from "../../modules/notification/service";

type UpdateTrackingInput = {
  trackingId: string;
  buyerId?: string;
  orderId?: string;
  status:
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "returned";
  trackingEvents?: any[];
  actualDelivery?: Date;
  notes?: string;
};

const updateTrackingStatusStep = createStep(
  "update-tracking-status",
  async (input: UpdateTrackingInput, { container }) => {
    const shipmentService: ShipmentModuleService =
      container.resolve(SHIPMENT_MODULE);

    const updateData: any = {
      status: input.status,
      last_updated: new Date(),
    };

    if (input.trackingEvents) {
      updateData.tracking_events = input.trackingEvents;
    }

    if (input.actualDelivery) {
      updateData.actual_delivery = input.actualDelivery;
    }

    if (input.notes) {
      updateData.notes = input.notes;
    }

    const tracking = await shipmentService.updateShipmentTrackings({
      selector: {
        id: input.trackingId,
      },
      data: updateData,
    });

    // Send notification if delivered
    if (input.status === "delivered" && input.buyerId && input.orderId) {
      const notificationService: NotificationModuleService = container.resolve(
        "notificationModuleService"
      );

      await notificationService.createNotification({
        user_id: input.buyerId,
        type: "shipment_delivered",
        title: "Order Delivered",
        message: `Your order #${input.orderId} has been delivered! Please confirm delivery to release payment.`,
        data: { order_id: input.orderId },
        send_email: true,
      });
    }

    return new StepResponse(tracking[0]);
  }
);

export const updateShipmentTrackingWorkflow = createWorkflow(
  "update-shipment-tracking",
  (input: UpdateTrackingInput) => {
    const tracking = updateTrackingStatusStep(input);
    return new WorkflowResponse(tracking);
  }
);
