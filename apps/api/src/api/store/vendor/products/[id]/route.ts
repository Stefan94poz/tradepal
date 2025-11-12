import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateVendorProductWorkflow } from "../../../../../workflows/create-vendor-product";
import { Modules } from "@medusajs/framework/utils";

// GET /store/vendor/products/:id - Get single product
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { vendor_id } = req.query;

  if (!vendor_id) {
    return res.status(401).json({
      error: "Vendor authentication required",
    });
  }

  try {
    const remoteQuery = req.scope.resolve("remoteQuery");

    // Get product with vendor validation
    const products = await remoteQuery({
      entryPoint: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "status",
        "thumbnail",
        "metadata",
        "created_at",
        "updated_at",
        "variants.*",
        "variants.prices.*",
        "images.*",
        "options.*",
      ],
      variables: {
        filters: {
          id: id,
        },
      },
    });

    if (products.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const product = products[0];

    // Verify ownership
    const productVendorLinks = await remoteQuery({
      entryPoint: "product_vendor",
      fields: ["product_id", "vendor_id"],
      variables: {
        filters: {
          product_id: id,
        },
      },
    });

    if (
      productVendorLinks.length === 0 ||
      productVendorLinks[0].vendor_id !== vendor_id
    ) {
      return res.status(403).json({
        error: "You do not have permission to access this product",
      });
    }

    return res.json({ product });
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).json({
      error: "Failed to get product",
    });
  }
}

// POST /store/vendor/products/:id - Update product
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { vendor_id, ...update } = req.body as any;

  if (!vendor_id) {
    return res.status(401).json({
      error: "Vendor authentication required",
    });
  }

  try {
    const { result } = await updateVendorProductWorkflow(req.scope).run({
      input: {
        vendor_id,
        product_id: id,
        update,
      },
    });

    return res.json({
      product: result.product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);

    if (error.message?.includes("does not belong")) {
      return res.status(403).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: "Failed to update product",
    });
  }
}

// DELETE /store/vendor/products/:id - Delete product
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { vendor_id } = req.body as any;

  if (!vendor_id) {
    return res.status(401).json({
      error: "Vendor authentication required",
    });
  }

  try {
    const remoteQuery = req.scope.resolve("remoteQuery");

    // Verify ownership before deletion
    const productVendorLinks = await remoteQuery({
      entryPoint: "product_vendor",
      fields: ["product_id", "vendor_id"],
      variables: {
        filters: {
          product_id: id,
        },
      },
    });

    if (
      productVendorLinks.length === 0 ||
      productVendorLinks[0].vendor_id !== vendor_id
    ) {
      return res.status(403).json({
        error: "You do not have permission to delete this product",
      });
    }

    // Delete product
    const productModuleService = req.scope.resolve(Modules.PRODUCT);
    await productModuleService.deleteProducts([id]);

    return res.json({
      id,
      deleted: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      error: "Failed to delete product",
    });
  }
}
