import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import MeiliSearchService from "../services/meilisearch";

/**
 * Product Updated Subscriber
 * Re-indexes updated products in MeiliSearch with vendor metadata
 */
export default async function productUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const meilisearchService = new MeiliSearchService();
  const productModuleService = container.resolve("productModuleService");
  const remoteQuery = container.resolve("remoteQuery");

  try {
    // Fetch the product with all relations
    const product = await productModuleService.retrieveProduct(data.id, {
      relations: ["variants", "variants.prices"],
    });

    // Get vendor information for this product
    let vendorData: any = null;
    try {
      const productVendorLinks = await remoteQuery({
        entryPoint: "product_vendor",
        fields: ["product_id", "vendor_id", "vendor.*"],
        variables: {
          filters: {
            product_id: data.id,
          },
        },
      });

      if (productVendorLinks.length > 0) {
        const vendor = productVendorLinks[0].vendor;
        vendorData = {
          vendor_id: vendor.id,
          vendor_handle: vendor.handle,
          vendor_name: vendor.name,
          vendor_verification: vendor.verification_status,
        };
      }
    } catch (error) {
      console.log(`No vendor linked to product ${data.id}`);
    }

    // Re-index the product with vendor metadata
    await meilisearchService.indexProduct({
      ...product,
      ...vendorData,
    });

    console.log(
      `Product ${product.id} re-indexed in MeiliSearch${vendorData ? ` with vendor ${vendorData.vendor_name}` : ""}`
    );
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
