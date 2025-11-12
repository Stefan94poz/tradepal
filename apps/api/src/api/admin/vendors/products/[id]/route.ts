import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import {
  updateVendorProductWorkflow,
  UpdateVendorProductInput,
} from "../../../../../workflows/create-vendor-product";

/**
 * GET /admin/vendors/products/:id
 * Retrieve a specific vendor product with vendor details
 */
export async function GET(
  req: MedusaRequest<{ id: string }>,
  res: MedusaResponse
) {
  const remoteQuery = req.scope.resolve("remoteQuery");
  const productId = req.params.id;

  try {
    // Query product with vendor link
    const productVendorLinks = await remoteQuery({
      entryPoint: "product_vendor",
      fields: [
        "product_id",
        "vendor_id",
        "product.*",
        "product.variants.*",
        "product.variants.prices.*",
        "product.images.*",
        "product.options.*",
        "vendor.id",
        "vendor.name",
        "vendor.handle",
        "vendor.is_active",
      ],
      variables: {
        filters: {
          product_id: productId,
        },
      },
    });

    if (!productVendorLinks || productVendorLinks.length === 0) {
      return res.status(404).json({
        message: `Product ${productId} not found or not linked to any vendor`,
      });
    }

    const link = productVendorLinks[0];

    return res.json({
      product: {
        ...link.product,
        vendor: link.vendor,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch vendor product",
    });
  }
}

/**
 * PUT /admin/vendors/products/:id
 * Update a vendor product (with ownership validation)
 */
export async function PUT(
  req: MedusaRequest<{ id: string }>,
  res: MedusaResponse
) {
  const productId = req.params.id;
  const body = req.body as unknown as {
    vendor_id: string;
    title?: string;
    description?: string;
    handle?: string;
    status?: "draft" | "proposed" | "published" | "rejected";
    thumbnail?: string;
    metadata?: Record<string, any>;
  };

  const { vendor_id, ...update } = body;

  if (!vendor_id) {
    return res.status(400).json({
      message: "vendor_id is required",
    });
  }

  try {
    const { result } = await updateVendorProductWorkflow(req.scope).run({
      input: {
        vendor_id,
        product_id: productId,
        update,
      },
    });

    return res.json({
      product: result.product,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to update vendor product",
    });
  }
}

/**
 * DELETE /admin/vendors/products/:id
 * Delete a vendor product (soft delete by setting status to 'rejected')
 */
export async function DELETE(
  req: MedusaRequest<{ id: string }>,
  res: MedusaResponse
) {
  const productId = req.params.id;
  const body = req.body as unknown as { vendor_id: string };
  const { vendor_id } = body;
  const productModuleService = req.scope.resolve(Modules.PRODUCT);

  if (!vendor_id) {
    return res.status(400).json({
      message: "vendor_id is required",
    });
  }

  try {
    // Use update workflow to validate ownership before deletion
    await updateVendorProductWorkflow(req.scope).run({
      input: {
        vendor_id,
        product_id: productId,
        update: {
          status: "rejected" as const,
        },
      },
    });

    // Soft delete the product
    await productModuleService.softDeleteProducts([productId]);

    return res.json({
      id: productId,
      deleted: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to delete vendor product",
    });
  }
}
