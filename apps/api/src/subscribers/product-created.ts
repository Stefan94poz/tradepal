import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import MeiliSearchService from "../services/meilisearch";

/**
 * Product Created Subscriber
 * Automatically indexes new products in MeiliSearch
 */
export default async function productCreatedHandler({
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

    // Index the product
    await meilisearchService.indexProduct(product);

    console.log(`Product ${product.id} indexed in MeiliSearch`);
  } catch (error) {
    console.error(
      `Failed to index product ${data.id} in MeiliSearch:`,
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
};
