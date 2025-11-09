import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * POST /webhooks/stripe
 * Handle Stripe webhook events
 * 
 * Important events for escrow:
 * - payment_intent.succeeded: Payment authorized
 * - payment_intent.payment_failed: Payment failed
 * - charge.captured: Payment captured
 * - charge.refunded: Payment refunded
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("[STRIPE WEBHOOK] Webhook secret not configured");
      return res.status(400).json({ error: "Webhook secret not configured" });
    }

    // TODO: Verify webhook signature using Stripe SDK
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    const event = req.body as any;

    console.log(`[STRIPE WEBHOOK] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log(`[STRIPE WEBHOOK] Payment intent succeeded: ${event.data.object.id}`);
        // TODO: Update escrow status to "held"
        break;

      case "payment_intent.payment_failed":
        console.log(`[STRIPE WEBHOOK] Payment intent failed: ${event.data.object.id}`);
        // TODO: Update escrow status to "failed"
        break;

      case "charge.captured":
        console.log(`[STRIPE WEBHOOK] Charge captured: ${event.data.object.id}`);
        // TODO: Update escrow status to "released"
        break;

      case "charge.refunded":
        console.log(`[STRIPE WEBHOOK] Charge refunded: ${event.data.object.id}`);
        // TODO: Update escrow status to "refunded"
        break;

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[STRIPE WEBHOOK] Error processing webhook:", error);
    res.status(400).json({
      error: "Webhook error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
