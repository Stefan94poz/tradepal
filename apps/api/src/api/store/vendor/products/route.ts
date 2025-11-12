import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  createVendorProductWorkflow,
  updateVendorProductWorkflow,
} from "../../../../workflows/create-vendor-product";

// POST /store/vendor/products - Create product (vendor must be authenticated)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // TODO: Get vendor_id from authenticated session
  // For now, expect it in the request body
  const { vendor_id, product } = req.body as any;

  if (!vendor_id) {
    return res.status(401).json({
      error: "Vendor authentication required",
    });
  }

  if (!product) {
    return res.status(400).json({
      error: "Product data is required",
    });
  }

  // Validate required product fields
  if (!product.title) {
    return res.status(400).json({
      error: "Product title is required",
    });
  }

  try {
    const { result } = await createVendorProductWorkflow(req.scope).run({
      input: {
        vendor_id,
        product,
      },
    });

    return res.status(201).json({
      product: result.product,
      message: "Product created successfully in draft status",
    });
  } catch (error) {
    console.error("Error creating vendor product:", error);

    if (error.message?.includes("not active")) {
      return res.status(403).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: "Failed to create product. Please try again later.",
    });
  }
}

// GET /store/vendor/products - List vendor's products
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { vendor_id } = req.query;

  if (!vendor_id) {
    return res.status(401).json({
      error: "Vendor authentication required",
    });
  }

  try {
    const remoteQuery = req.scope.resolve("remoteQuery");

    // Query products linked to this vendor
    const products = await remoteQuery({
      entryPoint: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "status",
        "thumbnail",
        "created_at",
        "updated_at",
        "variants.*",
        "images.*",
      ],
      variables: {
        filters: {
          vendor_id: vendor_id,
        },
      },
    });

    return res.json({
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error listing vendor products:", error);
    return res.status(500).json({
      error: "Failed to list products",
    });
  }
}
