import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { COMMISSION_MODULE } from "../../../../modules/commission";

/**
 * GET /admin/vendors/commissions
 * List commissions for authenticated vendor with filters
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const commissionModuleService = req.scope.resolve(COMMISSION_MODULE);
  const {
    vendor_id,
    status,
    limit = 50,
    offset = 0,
    date_from,
    date_to,
  } = req.query;

  if (!vendor_id) {
    return res.status(400).json({
      message: "vendor_id is required",
    });
  }

  try {
    // Build filters
    const filters: any = {
      vendor_id: vendor_id as string,
    };

    if (status) {
      filters.status = status;
    }

    // Get commissions with filters
    const commissions = await commissionModuleService.listCommissions(filters, {
      skip: Number(offset),
      take: Number(limit),
      order: { created_at: "DESC" },
    });

    // Filter by date range if provided
    let filteredCommissions = commissions;
    if (date_from || date_to) {
      filteredCommissions = commissions.filter((commission: any) => {
        const createdAt = new Date(commission.created_at);
        if (date_from && createdAt < new Date(date_from as string))
          return false;
        if (date_to && createdAt > new Date(date_to as string)) return false;
        return true;
      });
    }

    // Calculate summary
    const summary = {
      total_commissions: filteredCommissions.length,
      total_earned: filteredCommissions.reduce(
        (sum: number, c: any) => sum + c.commission_amount,
        0
      ),
      total_pending: filteredCommissions
        .filter((c: any) => c.status === "pending")
        .reduce((sum: number, c: any) => sum + c.net_amount, 0),
      total_paid: filteredCommissions
        .filter((c: any) => c.status === "paid")
        .reduce((sum: number, c: any) => sum + c.net_amount, 0),
    };

    return res.json({
      commissions: filteredCommissions,
      summary,
      count: filteredCommissions.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch commissions",
    });
  }
}
