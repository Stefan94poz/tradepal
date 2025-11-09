import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

/**
 * GET /store/products/search
 * Global product search with B2B filters
 * 
 * Query parameters:
 * - q: Search query (name, description)
 * - category_id: Filter by category
 * - min_price: Minimum price
 * - max_price: Maximum price
 * - seller_location: Filter by seller country/city
 * - min_order_qty: Filter by minimum order quantity
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      q,
      category_id,
      min_price,
      max_price,
      seller_location,
      min_order_qty,
      page = "1",
      limit = "20",
    } = req.query as {
      q?: string;
      category_id?: string;
      min_price?: string;
      max_price?: string;
      seller_location?: string;
      min_order_qty?: string;
      page?: string;
      limit?: string;
    };

    const productModuleService = req.scope.resolve(Modules.PRODUCT);

    // Build filters
    const filters: any = {
      status: "published", // Only show published products
    };

    if (q) {
      // Text search in title and description
      filters.$or = [
        { title: { $ilike: `%${q}%` } },
        { description: { $ilike: `%${q}%` } },
      ];
    }

    if (category_id) {
      filters.category_id = category_id;
    }

    // TODO: Price filtering requires querying variant prices
    // This will be implemented after MeiliSearch integration (Task 7.3.1)

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // Retrieve products
    const [products, count] = await productModuleService.listAndCountProducts(
      filters,
      {
        skip: offset,
        take: limitNum,
        relations: ["variants", "images", "categories"],
      }
    );

    // Filter by B2B metadata fields (min_order_qty, seller_location)
    // This is done in-memory until MeiliSearch is integrated
    let filteredProducts = products;

    if (min_order_qty) {
      const minQty = parseInt(min_order_qty, 10);
      filteredProducts = filteredProducts.filter((product) => {
        const metadata = product.metadata as any;
        const productMinQty = metadata?.min_order_qty || 1;
        return productMinQty <= minQty;
      });
    }

    if (seller_location) {
      filteredProducts = filteredProducts.filter((product) => {
        const metadata = product.metadata as any;
        const location = metadata?.seller_location || "";
        return location.toLowerCase().includes(seller_location.toLowerCase());
      });
    }

    res.json({
      products: filteredProducts,
      count: filteredProducts.length,
      page: pageNum,
      limit: limitNum,
      total_pages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to search products",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
