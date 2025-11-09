import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SHIPMENT_MODULE } from "../../../../modules/shipment";
import ShipmentModuleService from "../../../../modules/shipment/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const shipmentService: ShipmentModuleService =
    req.scope.resolve(SHIPMENT_MODULE);

  const { status, limit = 20, offset = 0 } = req.query;

  const filters: any = {};

  if (status) {
    filters.status = status;
  }

  const [trackings, count] =
    await shipmentService.listAndCountShipmentTrackings(filters, {
      skip: Number(offset),
      take: Number(limit),
      order: { created_at: "DESC" },
    });

  res.json({
    trackings,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
};
