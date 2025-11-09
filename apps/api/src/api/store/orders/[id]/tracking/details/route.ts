import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { SHIPMENT_MODULE } from "../../../../../../modules/shipment";
import ShipmentModuleService from "../../../../../../modules/shipment/service";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id: orderId } = req.params;
  const shipmentService: ShipmentModuleService =
    req.scope.resolve(SHIPMENT_MODULE);

  const [trackings] = await shipmentService.listShipmentTrackings({
    order_id: orderId,
  });

  const tracking = trackings.length > 0 ? trackings[0] : null;

  res.json({
    tracking,
  });
};
