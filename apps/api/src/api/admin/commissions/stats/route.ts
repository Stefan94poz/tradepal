import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { COMMISSION_MODULE } from "../../../../modules/commission";

/**
 * GET /admin/commissions/stats
 * Get platform-wide commission analytics and revenue reports
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const commissionModuleService = req.scope.resolve(COMMISSION_MODULE);
  const { date_from, date_to } = req.query;

  try {
    // Get all commissions
    const allCommissions = await commissionModuleService.listCommissions(
      {},
      {
        order: { created_at: "DESC" },
      }
    );

    // Filter by date range if provided
    let filteredCommissions = allCommissions;
    if (date_from || date_to) {
      filteredCommissions = allCommissions.filter((commission: any) => {
        const createdAt = new Date(commission.created_at);
        if (date_from && createdAt < new Date(date_from as string))
          return false;
        if (date_to && createdAt > new Date(date_to as string)) return false;
        return true;
      });
    }

    // Calculate platform statistics
    const stats = {
      total_commissions: filteredCommissions.length,
      total_revenue: filteredCommissions.reduce(
        (sum: number, c: any) => sum + c.commission_amount,
        0
      ),
      total_platform_fees: filteredCommissions.reduce(
        (sum: number, c: any) => sum + c.platform_fee,
        0
      ),
      pending: {
        count: filteredCommissions.filter((c: any) => c.status === "pending")
          .length,
        amount: filteredCommissions
          .filter((c: any) => c.status === "pending")
          .reduce((sum: number, c: any) => sum + c.commission_amount, 0),
      },
      processing: {
        count: filteredCommissions.filter((c: any) => c.status === "processing")
          .length,
        amount: filteredCommissions
          .filter((c: any) => c.status === "processing")
          .reduce((sum: number, c: any) => sum + c.commission_amount, 0),
      },
      paid: {
        count: filteredCommissions.filter((c: any) => c.status === "paid")
          .length,
        amount: filteredCommissions
          .filter((c: any) => c.status === "paid")
          .reduce((sum: number, c: any) => sum + c.commission_amount, 0),
      },
      failed: {
        count: filteredCommissions.filter((c: any) => c.status === "failed")
          .length,
        amount: filteredCommissions
          .filter((c: any) => c.status === "failed")
          .reduce((sum: number, c: any) => sum + c.commission_amount, 0),
      },
      refunded: {
        count: filteredCommissions.filter((c: any) => c.status === "refunded")
          .length,
        amount: filteredCommissions
          .filter((c: any) => c.status === "refunded")
          .reduce((sum: number, c: any) => sum + c.commission_amount, 0),
      },
    };

    // Get unique vendor count
    const uniqueVendors = new Set(
      filteredCommissions.map((c: any) => c.vendor_id)
    );

    // Group by vendor for top performers
    const vendorCommissions = new Map<string, any>();
    filteredCommissions.forEach((commission: any) => {
      const existing = vendorCommissions.get(commission.vendor_id) || {
        vendor_id: commission.vendor_id,
        total_commission: 0,
        count: 0,
      };
      existing.total_commission += commission.commission_amount;
      existing.count += 1;
      vendorCommissions.set(commission.vendor_id, existing);
    });

    const topVendors = Array.from(vendorCommissions.values())
      .sort((a, b) => b.total_commission - a.total_commission)
      .slice(0, 10);

    return res.json({
      stats,
      vendor_count: uniqueVendors.size,
      top_vendors: topVendors,
      date_range: {
        from: date_from || null,
        to: date_to || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch commission statistics",
    });
  }
}
