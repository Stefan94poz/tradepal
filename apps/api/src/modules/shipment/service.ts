import { MedusaService } from "@medusajs/framework/utils";
import ShipmentTracking from "./models/shipment-tracking";

class ShipmentModuleService extends MedusaService({
  ShipmentTracking,
}) {
  async addTracking(data: {
    order_id: string;
    carrier: string;
    tracking_number: string;
  }) {
    return await this.createShipmentTrackings({
      ...data,
      status: "pending" as const,
      last_updated: new Date(),
      tracking_events: {},
    });
  }

  async updateTrackingStatus(
    orderId: string,
    status: "pending" | "in_transit" | "delivered" | "failed",
    location?: string
  ) {
    const trackings = await this.listShipmentTrackings({
      filters: { order_id: orderId },
    });

    if (!trackings || trackings.length === 0) {
      throw new Error("Tracking not found");
    }

    const updateData: any = {
      id: trackings[0].id,
      status,
      last_updated: new Date(),
    };

    if (location) {
      updateData.current_location = location;
    }

    return await this.updateShipmentTrackings(updateData);
  }
}

export default ShipmentModuleService;
