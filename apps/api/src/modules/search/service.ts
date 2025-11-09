import { MeiliSearch } from "meilisearch";
import { MedusaService } from "@medusajs/framework/utils";

class SearchService extends MedusaService({}) {
  private client: MeiliSearch;
  private productIndex = "products";
  private partnerIndex = "partners";

  constructor(container: any, options: any) {
    super(...arguments);

    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
      apiKey: process.env.MEILISEARCH_API_KEY || "masterKey",
    });

    // Initialize indexes
    this.initIndexes();
  }

  private async initIndexes() {
    try {
      // Create products index
      await this.client.createIndex(this.productIndex, {
        primaryKey: "id",
      });

      // Configure searchable attributes
      await this.client
        .index(this.productIndex)
        .updateSearchableAttributes([
          "title",
          "description",
          "company_name",
          "tags",
        ]);

      // Configure filterable attributes
      await this.client
        .index(this.productIndex)
        .updateFilterableAttributes([
          "category",
          "seller_location",
          "minimum_order_quantity",
          "price",
          "availability_status",
        ]);

      // Configure sortable attributes
      await this.client
        .index(this.productIndex)
        .updateSortableAttributes([
          "price",
          "created_at",
          "minimum_order_quantity",
        ]);

      // Create partners index
      await this.client.createIndex(this.partnerIndex, {
        primaryKey: "id",
      });

      await this.client
        .index(this.partnerIndex)
        .updateSearchableAttributes(["company_name", "description"]);

      await this.client
        .index(this.partnerIndex)
        .updateFilterableAttributes([
          "country",
          "industry",
          "looking_for",
          "offers",
          "is_verified",
        ]);

      console.log("MeiliSearch indexes initialized");
    } catch (error: any) {
      if (error.code !== "index_already_exists") {
        console.error("Error initializing MeiliSearch indexes:", error);
      }
    }
  }

  async indexProduct(product: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    company_name?: string;
    seller_location?: string;
    minimum_order_quantity?: number;
    price?: number;
    availability_status?: string;
    tags?: string[];
    created_at?: Date;
  }) {
    await this.client.index(this.productIndex).addDocuments([product]);
  }

  async indexProducts(products: any[]) {
    if (products.length === 0) return;
    await this.client.index(this.productIndex).addDocuments(products);
  }

  async searchProducts(params: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerLocation?: string;
    minMoq?: number;
    maxMoq?: number;
    availabilityStatus?: string;
    limit?: number;
    offset?: number;
    sort?: string[];
  }) {
    const filters: string[] = [];

    if (params.category) {
      filters.push(`category = "${params.category}"`);
    }
    if (params.sellerLocation) {
      filters.push(`seller_location = "${params.sellerLocation}"`);
    }
    if (params.availabilityStatus) {
      filters.push(`availability_status = "${params.availabilityStatus}"`);
    }
    if (params.minPrice !== undefined) {
      filters.push(`price >= ${params.minPrice}`);
    }
    if (params.maxPrice !== undefined) {
      filters.push(`price <= ${params.maxPrice}`);
    }
    if (params.minMoq !== undefined) {
      filters.push(`minimum_order_quantity >= ${params.minMoq}`);
    }
    if (params.maxMoq !== undefined) {
      filters.push(`minimum_order_quantity <= ${params.maxMoq}`);
    }

    const results = await this.client
      .index(this.productIndex)
      .search(params.query || "", {
        filter: filters.length > 0 ? filters : undefined,
        limit: params.limit || 20,
        offset: params.offset || 0,
        sort: params.sort,
      });

    return {
      hits: results.hits,
      total: results.estimatedTotalHits || 0,
      query: params.query,
      processingTimeMs: results.processingTimeMs,
    };
  }

  async indexPartner(partner: {
    id: string;
    company_name: string;
    description?: string;
    country: string;
    industry: string[];
    looking_for: string[];
    offers: string[];
    is_verified: boolean;
  }) {
    await this.client.index(this.partnerIndex).addDocuments([partner]);
  }

  async searchPartners(params: {
    query?: string;
    country?: string;
    industry?: string[];
    lookingFor?: string[];
    offers?: string[];
    limit?: number;
    offset?: number;
  }) {
    const filters: string[] = ["is_verified = true"]; // Only show verified partners

    if (params.country) {
      filters.push(`country = "${params.country}"`);
    }
    if (params.industry && params.industry.length > 0) {
      const industryFilters = params.industry
        .map((ind) => `industry = "${ind}"`)
        .join(" OR ");
      filters.push(`(${industryFilters})`);
    }
    if (params.lookingFor && params.lookingFor.length > 0) {
      const lookingForFilters = params.lookingFor
        .map((lf) => `looking_for = "${lf}"`)
        .join(" OR ");
      filters.push(`(${lookingForFilters})`);
    }
    if (params.offers && params.offers.length > 0) {
      const offersFilters = params.offers
        .map((offer) => `offers = "${offer}"`)
        .join(" OR ");
      filters.push(`(${offersFilters})`);
    }

    const results = await this.client
      .index(this.partnerIndex)
      .search(params.query || "", {
        filter: filters.length > 0 ? filters : undefined,
        limit: params.limit || 20,
        offset: params.offset || 0,
      });

    return {
      hits: results.hits,
      total: results.estimatedTotalHits || 0,
      query: params.query,
      processingTimeMs: results.processingTimeMs,
    };
  }

  async deleteProduct(productId: string) {
    await this.client.index(this.productIndex).deleteDocument(productId);
  }

  async deletePartner(partnerId: string) {
    await this.client.index(this.partnerIndex).deleteDocument(partnerId);
  }
}

export default SearchService;
