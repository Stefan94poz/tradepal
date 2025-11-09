import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import MeiliSearchService from "../services/meilisearch";

/**
 * Product Updated Subscriber
 * Re-indexes updated products in MeiliSearch
 */
export default async function productUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const meilisearchService = new MeiliSearchService();
  const productModuleService = container.resolve("productModuleService");

  try {
    // Fetch the product with all relations
    const product = await productModuleService.retrieveProduct(data.id, {
      relations: ["variants", "variants.prices"],
    });

    // Re-index the product
    await meilisearchService.indexProduct(product);

    console.log(`Product ${product.id} re-indexed in MeiliSearch`);
  } catch (error) {
    console.error(
      `Failed to re-index product ${data.id} in MeiliSearch:`,
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "product.updated",
};
