import { MeiliSearch } from "meilisearch";

export default class MeiliSearchService {
  private client: MeiliSearch;
  private productIndex: string = "products";

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
      apiKey: process.env.MEILISEARCH_API_KEY || "masterKey",
    });
    this.setupIndexes();
  }

  private async setupIndexes() {
    try {
      // Create products index if it doesn't exist
      await this.client.getIndex(this.productIndex);
    } catch (error) {
      // Index doesn't exist, create it
      await this.client.createIndex(this.productIndex, {
        primaryKey: "id",
      });

      // Configure searchable and filterable attributes
      const index = this.client.index(this.productIndex);

      await index.updateSearchableAttributes([
        "title",
        "description",
        "handle",
        "vendor_name",
        "metadata.seller_location",
        "metadata.min_order_quantity",
        "metadata.company_name",
      ]);

      await index.updateFilterableAttributes([
        "collection_id",
        "type_id",
        "status",
        "vendor_id",
        "vendor_handle",
        "vendor_verification",
        "metadata.seller_location",
        "metadata.min_order_quantity",
        "metadata.seller_id",
        "metadata.is_verified",
        "variants.prices.amount",
      ]);

      await index.updateSortableAttributes([
        "created_at",
        "updated_at",
        "variants.prices.amount",
      ]);
    }
  }

  async indexProduct(product: any) {
    const index = this.client.index(this.productIndex);

    // Transform product for indexing
    const doc = {
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      status: product.status,
      collection_id: product.collection_id,
      type_id: product.type_id,
      created_at: product.created_at,
      updated_at: product.updated_at,
      metadata: product.metadata || {},
      // Vendor metadata (from product-created/updated subscribers)
      vendor_id: product.vendor_id || null,
      vendor_handle: product.vendor_handle || null,
      vendor_name: product.vendor_name || null,
      vendor_verification: product.vendor_verification || null,
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        prices: v.prices?.map((p: any) => ({
          amount: p.amount,
          currency_code: p.currency_code,
        })),
      })),
    };

    await index.addDocuments([doc]);
  }

  async indexProducts(products: any[]) {
    const index = this.client.index(this.productIndex);

    const docs = products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      status: product.status,
      collection_id: product.collection_id,
      type_id: product.type_id,
      created_at: product.created_at,
      updated_at: product.updated_at,
      metadata: product.metadata || {},
      // Vendor metadata
      vendor_id: product.vendor_id || null,
      vendor_handle: product.vendor_handle || null,
      vendor_name: product.vendor_name || null,
      vendor_verification: product.vendor_verification || null,
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        prices: v.prices?.map((p: any) => ({
          amount: p.amount,
          currency_code: p.currency_code,
        })),
      })),
    }));

    await index.addDocuments(docs);
  }

  async deleteProduct(productId: string) {
    const index = this.client.index(this.productIndex);
    await index.deleteDocument(productId);
  }

  async searchProducts(query: string, filters?: any) {
    const index = this.client.index(this.productIndex);

    const searchParams: any = {
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    };

    // Build filter string
    const filterParts: string[] = [];

    // Vendor filters
    if (filters?.vendor_id) {
      filterParts.push(`vendor_id = "${filters.vendor_id}"`);
    }

    if (filters?.vendor_handle) {
      filterParts.push(`vendor_handle = "${filters.vendor_handle}"`);
    }

    if (filters?.vendor_verification) {
      filterParts.push(
        `vendor_verification = "${filters.vendor_verification}"`
      );
    }

    // Legacy seller filters (maintain backward compatibility)
    if (filters?.seller_location) {
      filterParts.push(
        `metadata.seller_location = "${filters.seller_location}"`
      );
    }

    if (filters?.min_order_quantity) {
      filterParts.push(
        `metadata.min_order_quantity <= ${filters.min_order_quantity}`
      );
    }

    if (filters?.seller_id) {
      filterParts.push(`metadata.seller_id = "${filters.seller_id}"`);
    }

    if (filters?.is_verified !== undefined) {
      filterParts.push(`metadata.is_verified = ${filters.is_verified}`);
    }

    if (filters?.collection_id) {
      filterParts.push(`collection_id = "${filters.collection_id}"`);
    }

    if (filters?.price_min !== undefined) {
      filterParts.push(`variants.prices.amount >= ${filters.price_min}`);
    }

    if (filters?.price_max !== undefined) {
      filterParts.push(`variants.prices.amount <= ${filters.price_max}`);
    }

    if (filterParts.length > 0) {
      searchParams.filter = filterParts.join(" AND ");
    }

    // Add sorting
    if (filters?.sort) {
      searchParams.sort = [filters.sort];
    }

    const results = await index.search(query, searchParams);

    return {
      hits: results.hits,
      total: results.estimatedTotalHits,
      limit: searchParams.limit,
      offset: searchParams.offset,
    };
  }

  async getStats() {
    const index = this.client.index(this.productIndex);
    return await index.getStats();
  }
}
