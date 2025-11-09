import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { SHIPMENT_MODULE } from "../../../../../../../modules/shipment";
import { updateShipmentTrackingWorkflow } from "../../../../../../../workflows/shipment/update-tracking";
import ShipmentModuleService from "../../../../../../../modules/shipment/service";

export const PUT = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id: orderId } = req.params;
  const shipmentService: ShipmentModuleService =
    req.scope.resolve(SHIPMENT_MODULE);

  // Get tracking for this order
  const [trackings] = await shipmentService.listShipmentTrackings({
    order_id: orderId,
  });

  if (trackings.length === 0) {
    return res.status(404).json({
      error: "No tracking found for this order",
    });
  }

  const tracking = trackings[0];

  // TODO: Fetch latest tracking info from carrier API
  // For now, just update the last_updated timestamp
  const { result } = await updateShipmentTrackingWorkflow(req.scope).run({
    input: {
      trackingId: tracking.id,
      status: tracking.status,
      notes: "Manually refreshed",
    },
  });

  res.json({
    tracking: result,
  });
};
