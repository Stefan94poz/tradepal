import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { COMMISSION_MODULE } from "../../../modules/commission";

// GET /admin/commissions - List all commissions
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const commissionModuleService = req.scope.resolve(COMMISSION_MODULE);

  const { limit = 20, offset = 0, vendor_id, order_id, status } = req.query;

  const filters: any = {};
  if (vendor_id) filters.vendor_id = vendor_id;
  if (order_id) filters.order_id = order_id;
  if (status) filters.status = status;

  try {
    const [commissions, count] =
      await commissionModuleService.listAndCountCommissions(filters, {
        skip: Number(offset),
        take: Number(limit),
        order: { created_at: "DESC" },
      });

    return res.json({
      commissions,
      count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error("Error listing commissions:", error);
    return res.status(500).json({
      error: "Failed to list commissions",
    });
  }
}
