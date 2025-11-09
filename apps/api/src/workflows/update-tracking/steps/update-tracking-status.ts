import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type UpdateTrackingStatusStepInput = {
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

export const updateTrackingStatusStep = createStep(
  "update-tracking-status-step",
  async (input: UpdateTrackingStatusStepInput, { container }) => {
    const {
      trackingId,
      status,
      currentLocation,
      estimatedDelivery,
      eventDescription,
    } = input;

    const shipmentModuleService = container.resolve("shipmentModuleService");

    // Get current tracking details
    const tracking = await (
      shipmentModuleService as any
    ).retrieveShipmentTracking(trackingId);

    if (!tracking) {
      throw new Error(`Tracking ${trackingId} not found`);
    }

    // Update tracking status
    const updatedTracking = await (
      shipmentModuleService as any
    ).updateTrackingStatus(trackingId, {
      status,
      current_location: currentLocation,
      estimated_delivery: estimatedDelivery,
      event_description: eventDescription,
    });

    return new StepResponse(
      {
        id: updatedTracking.id,
        status: updatedTracking.status,
        orderId: updatedTracking.order_id,
      },
      {
        trackingId: updatedTracking.id,
        previousStatus: tracking.status,
        previousLocation: tracking.current_location,
      }
    );
  },
  async (compensateData, { container }) => {
    if (!compensateData) return;

    const { trackingId, previousStatus, previousLocation } = compensateData;

    // Rollback: Restore previous status
    const shipmentModuleService = container.resolve("shipmentModuleService");

    await (shipmentModuleService as any).updateShipmentTrackings({
      id: trackingId,
      status: previousStatus,
      current_location: previousLocation,
    });

    console.log(
      `[TRACKING ROLLBACK] Restored tracking ${trackingId} status to ${previousStatus}`
    );
  }
);
