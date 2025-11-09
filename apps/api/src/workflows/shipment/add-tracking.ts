import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { SHIPMENT_MODULE } from "../../modules/shipment";
import ShipmentModuleService from "../../modules/shipment/service";
import NotificationModuleService from "../../modules/notification/service";

type AddTrackingInput = {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  buyerId: string;
  estimatedDelivery?: Date;
  trackingUrl?: string;
};

const addTrackingStep = createStep(
  "add-tracking",
  async (input: AddTrackingInput, { container }) => {
    const shipmentService: ShipmentModuleService =
      container.resolve(SHIPMENT_MODULE);

    const tracking = await shipmentService.createShipmentTrackings({
      order_id: input.orderId,
      carrier: input.carrier,
      tracking_number: input.trackingNumber,
      status: "pending",
      tracking_events: null,
      estimated_delivery: input.estimatedDelivery || null,
      shipped_at: new Date(),
      last_updated: new Date(),
      tracking_url: input.trackingUrl || null,
    });

    // Send notification to buyer
    const notificationService: NotificationModuleService = container.resolve(
      "notificationModuleService"
    );

    await notificationService.createNotification({
      user_id: input.buyerId,
      type: "shipment_created",
      title: "Order Shipped",
      message: `Your order #${input.orderId} has been shipped! Tracking: ${input.trackingNumber}`,
      data: {
        order_id: input.orderId,
        tracking_number: input.trackingNumber,
        carrier: input.carrier,
      },
      send_email: true,
    });

    return new StepResponse(tracking, tracking.id);
  },
  async (trackingId, { container }) => {
    if (!trackingId) return;

    const shipmentService: ShipmentModuleService =
      container.resolve(SHIPMENT_MODULE);

    await shipmentService.deleteShipmentTrackings(trackingId);
  }
);

export const addShipmentTrackingWorkflow = createWorkflow(
  "add-shipment-tracking",
  (input: AddTrackingInput) => {
    const tracking = addTrackingStep(input);
    return new WorkflowResponse(tracking);
  }
);
