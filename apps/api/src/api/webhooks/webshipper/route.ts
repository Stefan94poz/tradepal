import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * POST /webhooks/webshipper
 * Webhook handler for Webshipper tracking updates
 *
 * Webshipper sends webhook notifications for:
 * - tracking_update: When tracking status changes
 * - shipment_created: When a shipment is created
 * - shipment_delivered: When delivery is confirmed
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { event, data } = req.body as {
      event: string;
      data: any;
    };

    console.log(`Received Webshipper webhook: ${event}`, data);

    // Get shipment module service
    const shipmentModuleService: any = req.scope.resolve(
      "shipmentModuleService"
    );

    switch (event) {
      case "tracking_update": {
        // Update tracking status in database
        const orderId = data.external_id; // Our order ID
        const trackingData = {
          status: data.status,
          current_location: data.current_location,
          estimated_delivery: data.estimated_delivery,
          tracking_events: data.tracking_events || [],
        };

        try {
          // Find existing tracking by order ID
          const [existingTracking] =
            await shipmentModuleService.listShipmentTracking({
              order_id: orderId,
            });

          if (existingTracking) {
            // Update existing tracking
            await shipmentModuleService.updateShipmentTracking(
              existingTracking.id,
              trackingData
            );

            console.log(`Updated tracking for order ${orderId}`);
          }
        } catch (error) {
          console.error(
            `Failed to update tracking for order ${orderId}:`,
            error
          );
        }
        break;
      }

      case "shipment_delivered": {
        // Mark shipment as delivered
        const orderId = data.external_id;

        try {
          const [existingTracking] =
            await shipmentModuleService.listShipmentTracking({
              order_id: orderId,
            });

          if (existingTracking) {
            await shipmentModuleService.updateShipmentTracking(
              existingTracking.id,
              {
                status: "delivered",
                current_location: data.delivery_location,
                delivered_at: new Date().toISOString(),
              }
            );

            console.log(`Marked order ${orderId} as delivered`);

            // TODO: Trigger order completion workflow
            // This would trigger escrow release if buyer confirms
          }
        } catch (error) {
          console.error(`Failed to mark order ${orderId} as delivered:`, error);
        }
        break;
      }

      case "shipment_created": {
        console.log(`Shipment created for order ${data.external_id}`);
        // No action needed - this is just a confirmation
        break;
      }

      default:
        console.log(`Unhandled Webshipper event: ${event}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webshipper webhook error:", error);
    res.status(500).json({
      error: "Failed to process webhook",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
