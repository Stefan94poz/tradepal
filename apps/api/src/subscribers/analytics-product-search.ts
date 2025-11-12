import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { trackProductSearchWorkflow } from "../workflows/track-product-search";

/**
 * Analytics Subscriber - Product Search
 * Tracks search queries and results using Medusa Analytics Module
 */
export default async function productSearchAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  query: string;
  filters?: any;
  results_count: number;
  user_id?: string;
}>) {
  try {
    await trackProductSearchWorkflow(container).run({
      input: {
        query: data.query,
        filters: data.filters,
        results_count: data.results_count,
        user_id: data.user_id,
      },
    });

    console.log(`Tracked product search event: "${data.query}"`);
  } catch (error) {
    console.error("Failed to track product search event:", error);
  }
}

export const config: SubscriberConfig = {
  event: "product.searched",
};
