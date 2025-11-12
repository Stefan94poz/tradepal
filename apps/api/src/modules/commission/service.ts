import { MedusaService } from "@medusajs/framework/utils";
import Commission from "./models/commission";

class CommissionModuleService extends MedusaService({
  Commission,
}) {
  // Calculate commission for an order
  async calculateCommission(data: {
    vendor_id: string;
    order_id: string;
    order_total: number;
    commission_rate: number;
    currency_code?: string;
    line_item_id?: string;
  }) {
    const commission_amount = (data.order_total * data.commission_rate) / 100;
    const platform_fee = 0; // TODO: Calculate platform fees (Stripe, etc.)
    const net_amount = commission_amount - platform_fee;

    return this.createCommissions({
      vendor_id: data.vendor_id,
      order_id: data.order_id,
      line_item_id: data.line_item_id,
      order_total: data.order_total,
      commission_rate: data.commission_rate,
      commission_amount,
      platform_fee,
      net_amount,
      currency_code: data.currency_code || "usd",
      status: "pending",
    });
  }

  // Get commissions by vendor
  async getVendorCommissions(vendor_id: string, filters: any = {}) {
    return this.listCommissions(
      {
        vendor_id,
        ...filters,
      },
      {
        order: { created_at: "DESC" },
      }
    );
  }

  // Get commissions by order
  async getOrderCommissions(order_id: string) {
    return this.listCommissions({
      order_id,
    });
  }

  // Mark commission as paid
  async markAsPaid(commission_id: string, payout_id: string) {
    return this.updateCommissions({
      id: commission_id,
      status: "paid",
      payout_id,
      paid_at: new Date(),
    });
  }

  // Mark commission as failed
  async markAsFailed(commission_id: string, notes?: string) {
    return this.updateCommissions({
      id: commission_id,
      status: "failed",
      notes,
    });
  }

  // Get total pending commissions for vendor
  async getPendingTotal(vendor_id: string) {
    const commissions = await this.listCommissions({
      vendor_id,
      status: "pending",
    });

    return commissions.reduce(
      (total, commission) => total + commission.net_amount,
      0
    );
  }

  // Get commission statistics for vendor
  async getVendorStats(vendor_id: string) {
    const allCommissions = await this.listCommissions({ vendor_id });

    const stats = {
      total_earned: 0,
      pending: 0,
      paid: 0,
      processing: 0,
      failed: 0,
      count: allCommissions.length,
    };

    allCommissions.forEach((commission) => {
      stats.total_earned += commission.commission_amount;

      switch (commission.status) {
        case "pending":
          stats.pending += commission.net_amount;
          break;
        case "paid":
          stats.paid += commission.net_amount;
          break;
        case "processing":
          stats.processing += commission.net_amount;
          break;
        case "failed":
          stats.failed += commission.net_amount;
          break;
      }
    });

    return stats;
  }
}

export default CommissionModuleService;
