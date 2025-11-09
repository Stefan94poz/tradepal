import { MedusaService } from "@medusajs/framework/utils";
import { EscrowTransaction } from "./models/escrow-transaction";

class EscrowModuleService extends MedusaService({
  EscrowTransaction,
}) {}

export default EscrowModuleService;
