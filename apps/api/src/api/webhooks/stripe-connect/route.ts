import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Stripe from "stripe";
import { VENDOR_MODULE } from "../../../modules/vendor";
import VendorService from "../../../modules/vendor/service";

/**
 * POST /webhooks/stripe-connect
 * Handle Stripe Connect webhooks for account updates
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const stripeApiKey = process.env.STRIPE_API_KEY;
  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

  if (!stripeApiKey || !webhookSecret) {
    return res.status(400).json({
      message: "Stripe Connect webhooks not configured",
    });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({
      message: "Missing stripe-signature header",
    });
  }

  try {
    const stripe = new Stripe(stripeApiKey, {
      apiVersion: "2025-09-30.clover" as any,
    });

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body as string | Buffer,
      sig as string,
      webhookSecret
    );

    // Handle account.updated event
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      const vendor_id = account.metadata?.vendor_id;

      if (!vendor_id) {
        console.warn(
          `Stripe account ${account.id} has no vendor_id in metadata`
        );
        return res.status(200).json({ received: true });
      }

      const vendorService: VendorService = req.scope.resolve(VENDOR_MODULE);

      // Update vendor with Connect account status
      await vendorService.updateVendors({
        id: vendor_id,
        connect_charges_enabled: account.charges_enabled || false,
        connect_payouts_enabled: account.payouts_enabled || false,
      });

      console.log(
        `Updated vendor ${vendor_id} Connect status: charges=${account.charges_enabled}, payouts=${account.payouts_enabled}, details_submitted=${account.details_submitted}`
      );
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Stripe Connect webhook error:", error.message);
    return res.status(400).json({
      message: "Webhook error",
      error: error.message,
    });
  }
}
