import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ESCROW_MODULE } from "../../../../modules/escrow";
import EscrowModuleService from "../../../../modules/escrow/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const escrowService: EscrowModuleService = req.scope.resolve(ESCROW_MODULE);

  const filters: any = {};

  // Allow filtering by status
  if (req.query.status) {
    filters.status = req.query.status;
  }

  const [escrows, count] = await escrowService.listAndCountEscrowTransactions(
    filters,
    {
      take: parseInt(req.query.limit as string) || 20,
      skip: parseInt(req.query.offset as string) || 0,
      order: {
        created_at: "DESC",
      },
    }
  );

  res.json({
    escrows,
    count,
    limit: parseInt(req.query.limit as string) || 20,
    offset: parseInt(req.query.offset as string) || 0,
  });
};
