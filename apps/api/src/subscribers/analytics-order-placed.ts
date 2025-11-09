import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import AnalyticsService from "../services/analytics";

/**
 * Analytics Subscriber - Order Placed
 * Tracks order placement events in PostHog
 */
export default async function orderPlacedAnalyticsHandler({
  event: { data },
}: SubscriberArgs<{
  id: string;
  customer_id: string;
  total: number;
  currency_code: string;
}>) {
  const analyticsService = new AnalyticsService();

  try {
    await analyticsService.trackEvent(data.customer_id, "Order Placed", {
      order_id: data.id,
      total: data.total,
      currency: data.currency_code,
      timestamp: new Date().toISOString(),
    });

    console.log(`Tracked order placed event for customer ${data.customer_id}`);
  } catch (error) {
    console.error("Failed to track order placed event:", error);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
