import { MedusaService } from "@medusajs/framework/utils";
import { ShipmentTracking } from "./models/shipment-tracking";

class ShipmentModuleService extends MedusaService({
  ShipmentTracking,
}) {}

export default ShipmentModuleService;
