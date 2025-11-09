import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ESCROW_MODULE } from "../../../../../../modules/escrow";
import EscrowModuleService from "../../../../../../modules/escrow/service";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id: orderId } = req.params;
  const escrowService: EscrowModuleService = req.scope.resolve(ESCROW_MODULE);

  const [escrows] = await escrowService.listEscrowTransactions({
    order_id: orderId,
  });

  const escrow = escrows.length > 0 ? escrows[0] : null;

  res.json({
    escrow,
  });
};
