import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type AddTrackingInfoStepInput = {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  sellerId: string;
};

export const addTrackingInfoStep = createStep(
  "add-tracking-info-step",
  async (input: AddTrackingInfoStepInput, { container }) => {
    const { orderId, carrier, trackingNumber, sellerId } = input;

    const shipmentModuleService = container.resolve("shipmentModuleService");

    // Add tracking information
    const tracking = await (shipmentModuleService as any).addTracking({
      order_id: orderId,
      carrier,
      tracking_number: trackingNumber,
      status: "in_transit",
      current_location: "",
      estimated_delivery: null,
      tracking_events: {},
    });

    return new StepResponse(
      {
        id: tracking.id,
        orderId: tracking.order_id,
        trackingNumber: tracking.tracking_number,
      },
      {
        trackingId: tracking.id,
      }
    );
  },
  async (compensateData, { container }) => {
    if (!compensateData) return;

    const { trackingId } = compensateData;

    // Rollback: Delete tracking record
    const shipmentModuleService = container.resolve("shipmentModuleService");

    await (shipmentModuleService as any).deleteShipmentTrackings(trackingId);

    console.log(`[TRACKING ROLLBACK] Deleted tracking record: ${trackingId}`);
  }
);
