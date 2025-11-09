import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import MeiliSearchService from "../../../../services/meilisearch";

/**
 * GET /store/products/search
 * Global product search with B2B filters using MeiliSearch
 *
 * Query parameters:
 * - q: Search query (name, description)
 * - collection_id: Filter by collection
 * - min_price: Minimum price
 * - max_price: Maximum price
 * - seller_location: Filter by seller country/city
 * - min_order_qty: Filter by minimum order quantity
 * - seller_id: Filter by seller
 * - is_verified: Filter by verified sellers (true/false)
 * - sort: Sort field (created_at:desc, variants.prices.amount:asc, etc.)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      q = "",
      collection_id,
      min_price,
      max_price,
      seller_location,
      min_order_qty,
      seller_id,
      is_verified,
      sort,
      page = "1",
      limit = "20",
    } = req.query as {
      q?: string;
      collection_id?: string;
      min_price?: string;
      max_price?: string;
      seller_location?: string;
      min_order_qty?: string;
      seller_id?: string;
      is_verified?: string;
      sort?: string;
      page?: string;
      limit?: string;
    };

    const meilisearchService = new MeiliSearchService();

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build filters for MeiliSearch
    const filters: any = {
      limit: limitNum,
      offset,
    };

    if (collection_id) {
      filters.collection_id = collection_id;
    }

    if (seller_location) {
      filters.seller_location = seller_location;
    }

    if (min_order_qty) {
      filters.min_order_quantity = parseInt(min_order_qty, 10);
    }

    if (seller_id) {
      filters.seller_id = seller_id;
    }

    if (is_verified !== undefined) {
      filters.is_verified = is_verified === "true";
    }

    if (min_price) {
      filters.price_min = parseInt(min_price, 10) * 100; // Convert to cents
    }

    if (max_price) {
      filters.price_max = parseInt(max_price, 10) * 100; // Convert to cents
    }

    if (sort) {
      filters.sort = sort;
    }

    // Search using MeiliSearch
    const results = await meilisearchService.searchProducts(q, filters);

    res.json({
      products: results.hits,
      count: results.total,
      page: pageNum,
      limit: limitNum,
      total_pages: Math.ceil((results.total || 0) / limitNum),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to search products",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
