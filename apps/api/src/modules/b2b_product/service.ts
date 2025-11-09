import { MedusaService } from "@medusajs/framework/utils";
import B2BProductConfig from "./models/b2b_product_config";

class B2BProductConfigService extends MedusaService({
  B2BProductConfig,
}) {}

export default B2BProductConfigService;
