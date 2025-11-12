import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  createVendorProductWorkflow,
  CreateVendorProductInput,
} from "../../../../workflows/create-vendor-product";

/**
 * POST /admin/vendors/products
 * Create a new product for a vendor
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { vendor_id, product } = req.body as CreateVendorProductInput;

  if (!vendor_id) {
    return res.status(400).json({
      message: "vendor_id is required",
    });
  }

  if (!product || !product.title) {
    return res.status(400).json({
      message: "product.title is required",
    });
  }

  try {
    const { result } = await createVendorProductWorkflow(req.scope).run({
      input: {
        vendor_id,
        product,
      },
    });

    return res.json({
      product: result.product,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to create vendor product",
    });
  }
}

/**
 * GET /admin/vendors/products
 * List all products for vendors with optional filters
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const remoteQuery = req.scope.resolve("remoteQuery");
  const { vendor_id, status, limit = 50, offset = 0 } = req.query;

  try {
    // Query product-vendor links with product details
    const query: any = {
      entryPoint: "product_vendor",
      fields: [
        "product_id",
        "vendor_id",
        "product.id",
        "product.title",
        "product.handle",
        "product.description",
        "product.status",
        "product.thumbnail",
        "product.created_at",
        "product.updated_at",
        "vendor.id",
        "vendor.name",
        "vendor.handle",
      ],
      variables: {
        filters: {} as Record<string, any>,
        limit: Number(limit),
        offset: Number(offset),
      },
    };

    // Filter by vendor if provided
    if (vendor_id) {
      query.variables.filters.vendor_id = vendor_id;
    }

    // Filter by product status if provided
    if (status) {
      query.variables.filters["product.status"] = status;
    }

    const productVendorLinks = await remoteQuery(query);

    // Transform to include product details with vendor info
    const products = productVendorLinks.map((link: any) => ({
      ...link.product,
      vendor: link.vendor,
    }));

    return res.json({
      products,
      count: products.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch vendor products",
    });
  }
}
