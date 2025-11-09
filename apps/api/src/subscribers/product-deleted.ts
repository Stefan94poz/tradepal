import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import MeiliSearchService from "../services/meilisearch";

/**
 * Product Deleted Subscriber
 * Removes deleted products from MeiliSearch index
 */
export default async function productDeletedHandler({
  event: { data },
}: SubscriberArgs<{ id: string }>) {
  const meilisearchService = new MeiliSearchService();

  try {
    // Remove the product from index
    await meilisearchService.deleteProduct(data.id);

    console.log(`Product ${data.id} removed from MeiliSearch`);
  } catch (error) {
    console.error(
      `Failed to remove product ${data.id} from MeiliSearch:`,
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "product.deleted",
};
