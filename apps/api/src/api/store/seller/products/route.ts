import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * GET /store/seller/products
 * List all products for a seller
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { sellerId } = req.query as { sellerId?: string };

    if (!sellerId) {
      return res.status(400).json({
        error: "Missing required parameter: sellerId",
      });
    }

    const productModuleService = req.scope.resolve(Modules.PRODUCT);

    // Filter products by seller_id in metadata
    const [products, count] = await productModuleService.listAndCountProducts(
      {
        // metadata: { seller_id: sellerId } // Metadata filtering not directly supported
      },
      {
        relations: ["variants", "images", "categories"],
      }
    );

    // Filter in-memory by seller_id in metadata
    const sellerProducts = products.filter((product) => {
      const metadata = product.metadata as any;
      return metadata?.seller_id === sellerId;
    });

    res.json({
      products: sellerProducts,
      count: sellerProducts.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve products",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * POST /store/seller/products
 * Create a new product for a seller
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      sellerId,
      title,
      description,
      handle,
      images,
      variants,
      category_ids,
      min_order_qty,
      bulk_pricing,
      seller_location,
    } = req.body as {
      sellerId: string;
      title: string;
      description?: string;
      handle?: string;
      images?: { url: string }[];
      variants: Array<{
        title: string;
        sku?: string;
        prices: Array<{ amount: number; currency_code: string }>;
      }>;
      category_ids?: string[];
      min_order_qty?: number;
      bulk_pricing?: Record<string, number>; // { "10": 90, "50": 80 } = 10% off for 10+, 20% off for 50+
      seller_location?: string;
    };

    if (!sellerId || !title || !variants || variants.length === 0) {
      return res.status(400).json({
        error:
          "Missing required fields: sellerId, title, variants (with at least one variant)",
      });
    }

    // Create product with B2B metadata
    const { result } = await createProductsWorkflow(req.scope).run({
      input: {
        products: [
          {
            title,
            description,
            handle,
            images,
            variants,
            category_ids,
            status: "draft", // Default to draft, seller can publish later
            metadata: {
              seller_id: sellerId,
              min_order_qty: min_order_qty || 1,
              bulk_pricing: bulk_pricing || {},
              seller_location: seller_location || "",
            },
          },
        ],
      },
    });

    res.json({
      success: true,
      product: result[0],
      message: "Product created successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
