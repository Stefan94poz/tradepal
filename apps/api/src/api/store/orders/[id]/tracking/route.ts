import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { addTrackingWorkflow } from "../../../../../workflows/add-tracking";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { carrier, trackingNumber, sellerId } = req.body as {
      carrier: string;
      trackingNumber: string;
      sellerId: string;
    };

    if (!carrier || !trackingNumber || !sellerId) {
      return res.status(400).json({
        error: "Missing required fields: carrier, trackingNumber, sellerId",
      });
    }

    // TODO: Verify sellerId matches the seller for this order
    // This would require integration with Medusa's order module

    // Execute add tracking workflow
    const { result } = await addTrackingWorkflow(req.scope).run({
      input: {
        orderId: id,
        carrier,
        trackingNumber,
        sellerId,
      },
    });

    res.json({
      success: true,
      tracking: result.tracking,
      message: `Tracking added for order ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to add tracking",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;

    const shipmentModuleService = req.scope.resolve("shipmentModuleService");

    // Get tracking by order ID
    const trackings = await (
      shipmentModuleService as any
    ).listShipmentTrackings({
      order_id: id,
    });

    if (!trackings || trackings.length === 0) {
      return res.status(404).json({
        error: `Tracking not found for order ${id}`,
      });
    }

    const tracking = trackings[0];

    res.json({
      id: tracking.id,
      orderId: tracking.order_id,
      carrier: tracking.carrier,
      trackingNumber: tracking.tracking_number,
      status: tracking.status,
      currentLocation: tracking.current_location,
      estimatedDelivery: tracking.estimated_delivery,
      trackingEvents: tracking.tracking_events,
      createdAt: tracking.created_at,
      updatedAt: tracking.updated_at,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve tracking",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
