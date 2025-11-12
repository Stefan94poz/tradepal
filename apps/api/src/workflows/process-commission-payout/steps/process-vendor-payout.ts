import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMMISSION_MODULE } from "../../../modules/commission";
import { VENDOR_MODULE } from "../../../modules/vendor";

export type ProcessVendorPayoutInput = {
  vendor_id: string;
  commission_ids?: string[];
};

export const processVendorPayoutStep = createStep(
  "process-vendor-payout",
  async (input: ProcessVendorPayoutInput, { container }) => {
    const commissionModuleService = container.resolve(COMMISSION_MODULE);
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    // Get vendor
    const vendor = await vendorModuleService.retrieveVendor(input.vendor_id);

    if (!vendor) {
      throw new Error(`Vendor ${input.vendor_id} not found`);
    }

    if (!vendor.connect_account_id) {
      throw new Error(
        `Vendor ${vendor.name} does not have a Stripe Connect account configured`
      );
    }

    if (!vendor.connect_payouts_enabled) {
      throw new Error(
        `Payouts are not enabled for vendor ${vendor.name}'s Stripe account`
      );
    }

    // Get commissions to pay
    let commissions;
    if (input.commission_ids) {
      commissions = [];
      for (const id of input.commission_ids) {
        const commission = await commissionModuleService.retrieveCommission(id);
        if (
          commission.vendor_id === input.vendor_id &&
          commission.status === "pending"
        ) {
          commissions.push(commission);
        }
      }
    } else {
      commissions = await commissionModuleService.getVendorCommissions(
        input.vendor_id,
        { status: "pending" }
      );
    }

    if (commissions.length === 0) {
      return new StepResponse({
        success: true,
        message: "No pending commissions to pay",
        commissions: [],
      });
    }

    // Calculate total payout amount
    const totalAmount = commissions.reduce((sum, c) => sum + c.net_amount, 0);

    // TODO: Create Stripe transfer to connected account
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const transfer = await stripe.transfers.create({
    //   amount: Math.round(totalAmount * 100), // Convert to cents
    //   currency: commissions[0].currency_code,
    //   destination: vendor.connect_account_id,
    //   description: `Commission payout for ${commissions.length} order(s)`,
    // });

    // For now, simulate payout
    const payout_id = `payout_sim_${Date.now()}`;

    return new StepResponse(
      {
        success: true,
        payout_id,
        total_amount: totalAmount,
        commission_ids: commissions.map((c) => c.id),
        vendor_id: input.vendor_id,
      },
      {
        payout_id,
        commission_ids: commissions.map((c) => c.id),
      }
    );
  },
  async (data, { container }) => {
    if (!data) return;

    // Rollback: Mark payout as failed
    console.log(`Rollback: Payout ${data.payout_id} failed`);
    // TODO: Handle Stripe transfer reversal if needed
  }
);
