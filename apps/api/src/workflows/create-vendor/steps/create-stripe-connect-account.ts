import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import Stripe from "stripe";

/**
 * Step: Create Stripe Connect Account
 * Creates a Stripe Express account for vendor payouts
 */
export const createStripeConnectAccountStep = createStep(
  "create-stripe-connect-account",
  async (
    {
      vendor_id,
      email,
      country,
      business_name,
    }: {
      vendor_id: string;
      email: string;
      country: string;
      business_name: string;
    },
    { container }
  ) => {
    // Check if Stripe Connect is enabled
    const stripeApiKey = process.env.STRIPE_API_KEY;
    const stripeConnectEnabled = process.env.STRIPE_CONNECT_CLIENT_ID;

    if (!stripeApiKey || !stripeConnectEnabled) {
      console.log("Stripe Connect not configured - skipping account creation");
      return new StepResponse({ connect_account_id: null });
    }

    try {
      const stripe = new Stripe(stripeApiKey, {
        apiVersion: "2025-09-30.clover" as any,
      });

      // Create Stripe Express account
      const account = await stripe.accounts.create({
        type: "express",
        country: country || "US",
        email: email,
        business_type: "company",
        company: {
          name: business_name,
        },
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          vendor_id: vendor_id,
          platform: "tradepal",
        },
      });

      console.log(
        `Created Stripe Connect account ${account.id} for vendor ${vendor_id}`
      );

      return new StepResponse(
        { connect_account_id: account.id },
        { connect_account_id: account.id }
      );
    } catch (error: any) {
      console.error("Failed to create Stripe Connect account:", error.message);
      // Don't fail the entire vendor registration if Stripe account creation fails
      // This can be retried later
      return new StepResponse({ connect_account_id: null as string | null });
    }
  },
  async (compensateData, { container }) => {
    // Compensation: Delete the Stripe Connect account
    if (!compensateData?.connect_account_id) {
      return;
    }

    const stripeApiKey = process.env.STRIPE_API_KEY;
    if (!stripeApiKey) {
      return;
    }

    try {
      const stripe = new Stripe(stripeApiKey, {
        apiVersion: "2025-09-30.clover" as any,
      });

      await stripe.accounts.del(compensateData.connect_account_id);
      console.log(
        `Rollback: Deleted Stripe Connect account ${compensateData.connect_account_id}`
      );
    } catch (error: any) {
      console.error("Failed to delete Stripe Connect account:", error.message);
    }
  }
);
