import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { trackOrderPlacedWorkflow } from "../workflows/track-order-placed";

/**
 * Analytics Subscriber - Order Placed
 * Tracks order placement events in PostHog using Medusa Analytics Module
 */
export default async function orderPlacedAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await trackOrderPlacedWorkflow(container).run({
      input: {
        order_id: data.id,
      },
    });

    console.log(`Tracked order placed event for order ${data.id}`);
  } catch (error) {
    console.error("Failed to track order placed event:", error);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
