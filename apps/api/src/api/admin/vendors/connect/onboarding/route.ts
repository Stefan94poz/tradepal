import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Stripe from "stripe";
import { VENDOR_MODULE } from "../../../../../modules/vendor";
import VendorService from "../../../../../modules/vendor/service";

/**
 * POST /admin/vendors/connect/onboarding
 * Generate Stripe Connect account onboarding link for vendor
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // TODO: Get authenticated vendor ID from session/token
  const vendor_id = "vendor_123"; // Placeholder

  const { return_url, refresh_url } = req.body as {
    return_url?: string;
    refresh_url?: string;
  };

  const stripeApiKey = process.env.STRIPE_API_KEY;
  if (!stripeApiKey || !process.env.STRIPE_CONNECT_CLIENT_ID) {
    return res.status(400).json({
      message: "Stripe Connect is not configured",
    });
  }

  try {
    const vendorService: VendorService = req.scope.resolve(VENDOR_MODULE);

    // Get vendor
    const vendor = await vendorService.retrieveVendor(vendor_id);

    if (!vendor.connect_account_id) {
      return res.status(400).json({
        message: "Vendor does not have a Stripe Connect account",
      });
    }

    // Create Stripe account link for onboarding
    const stripe = new Stripe(stripeApiKey, {
      apiVersion: "2025-09-30.clover" as any,
    });

    const accountLink = await stripe.accountLinks.create({
      account: vendor.connect_account_id,
      refresh_url:
        refresh_url ||
        `${process.env.ADMIN_URL}/vendors/connect/onboarding`,
      return_url:
        return_url || `${process.env.ADMIN_URL}/vendors/dashboard`,
      type: "account_onboarding",
    });

    return res.status(200).json({
      url: accountLink.url,
      expires_at: accountLink.expires_at,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to generate onboarding link",
      error: error.message,
    });
  }
}
