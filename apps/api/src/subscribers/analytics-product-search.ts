import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import AnalyticsService from "../services/analytics";

/**
 * Analytics Subscriber - Product Search
 * Tracks search queries and results
 */
export default async function productSearchAnalyticsHandler({
  event: { data },
}: SubscriberArgs<{
  query: string;
  filters: any;
  results_count: number;
  user_id?: string;
}>) {
  const analyticsService = new AnalyticsService();

  try {
    const userId = data.user_id || "anonymous";

    await analyticsService.trackEvent(userId, "Product Search", {
      query: data.query,
      filters: data.filters,
      results_count: data.results_count,
      timestamp: new Date().toISOString(),
    });

    console.log(`Tracked product search event: "${data.query}"`);
  } catch (error) {
    console.error("Failed to track product search event:", error);
  }
}

export const config: SubscriberConfig = {
  event: "product.searched",
};
