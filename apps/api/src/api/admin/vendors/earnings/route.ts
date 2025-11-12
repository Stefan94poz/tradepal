import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { COMMISSION_MODULE } from "../../../../modules/commission";

/**
 * GET /admin/vendors/earnings
 * Get earnings summary for authenticated vendor
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const commissionModuleService = req.scope.resolve(COMMISSION_MODULE);
  const { vendor_id } = req.query;

  if (!vendor_id) {
    return res.status(400).json({
      message: "vendor_id is required",
    });
  }

  try {
    // Get vendor commission statistics
    const stats = await commissionModuleService.getVendorStats(
      vendor_id as string
    );

    // Get recent commissions for activity feed
    const recentCommissions = await commissionModuleService.listCommissions(
      {
        vendor_id: vendor_id as string,
      },
      {
        take: 10,
        order: { created_at: "DESC" },
      }
    );

    // Get pending total
    const pendingTotal = await commissionModuleService.getPendingTotal(
      vendor_id as string
    );

    return res.json({
      earnings: {
        total_earned: stats.total_earned,
        pending_amount: stats.pending,
        paid_amount: stats.paid,
        processing_amount: stats.processing,
        failed_amount: stats.failed,
        commission_count: stats.count,
        pending_total: pendingTotal,
      },
      recent_commissions: recentCommissions.map((c: any) => ({
        id: c.id,
        order_id: c.order_id,
        amount: c.commission_amount,
        net_amount: c.net_amount,
        status: c.status,
        created_at: c.created_at,
        paid_at: c.paid_at,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch earnings",
    });
  }
}
