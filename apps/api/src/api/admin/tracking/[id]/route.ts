import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { updateShipmentTrackingWorkflow } from "../../../../../workflows/shipment/update-tracking";
import { SHIPMENT_MODULE } from "../../../../../modules/shipment";
import ShipmentModuleService from "../../../../../modules/shipment/service";

type UpdateTrackingRequest = {
  status:
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "returned";
  trackingEvents?: any[];
  actualDelivery?: string;
  notes?: string;
};

export const PUT = async (
  req: AuthenticatedMedusaRequest<UpdateTrackingRequest>,
  res: MedusaResponse
) => {
  const { id: trackingId } = req.params;

  const { result } = await updateShipmentTrackingWorkflow(req.scope).run({
    input: {
      trackingId,
      status: req.validatedBody.status,
      trackingEvents: req.validatedBody.trackingEvents,
      actualDelivery: req.validatedBody.actualDelivery
        ? new Date(req.validatedBody.actualDelivery)
        : undefined,
      notes: req.validatedBody.notes,
    },
  });

  res.json({
    tracking: result,
  });
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id: trackingId } = req.params;
  const shipmentService: ShipmentModuleService =
    req.scope.resolve(SHIPMENT_MODULE);

  const tracking = await shipmentService.retrieveShipmentTracking(trackingId);

  res.json({
    tracking,
  });
};
