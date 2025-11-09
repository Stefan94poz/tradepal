import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import {
  updateProductsWorkflow,
  deleteProductsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * GET /store/seller/products/[id]
 * Get product details
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { sellerId } = req.query as { sellerId?: string };

    const productModuleService = req.scope.resolve(Modules.PRODUCT);

    const product = await productModuleService.retrieveProduct(id, {
      relations: ["variants", "images", "categories"],
    });

    if (!product) {
      return res.status(404).json({
        error: `Product ${id} not found`,
      });
    }

    // Verify seller owns this product
    if (sellerId) {
      const metadata = product.metadata as any;
      if (metadata?.seller_id !== sellerId) {
        return res.status(403).json({
          error: "You do not have permission to access this product",
        });
      }
    }

    res.json({
      product,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * PUT /store/seller/products/[id]
 * Update a product
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const {
      sellerId,
      title,
      description,
      handle,
      status,
      min_order_qty,
      bulk_pricing,
      seller_location,
    } = req.body as {
      sellerId: string;
      title?: string;
      description?: string;
      handle?: string;
      status?: string;
      min_order_qty?: number;
      bulk_pricing?: Record<string, number>;
      seller_location?: string;
    };

    if (!sellerId) {
      return res.status(400).json({
        error: "Missing required field: sellerId",
      });
    }

    // Verify seller owns this product
    const productModuleService = req.scope.resolve(Modules.PRODUCT);
    const product = await productModuleService.retrieveProduct(id);

    const metadata = product.metadata as any;
    if (metadata?.seller_id !== sellerId) {
      return res.status(403).json({
        error: "You do not have permission to update this product",
      });
    }

    // Prepare update data
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (handle !== undefined) updateData.handle = handle;
    if (status !== undefined) updateData.status = status;

    // Update B2B metadata
    const updatedMetadata = { ...metadata };
    if (min_order_qty !== undefined)
      updatedMetadata.min_order_qty = min_order_qty;
    if (bulk_pricing !== undefined) updatedMetadata.bulk_pricing = bulk_pricing;
    if (seller_location !== undefined)
      updatedMetadata.seller_location = seller_location;

    updateData.metadata = updatedMetadata;

    // Update product
    const { result } = await updateProductsWorkflow(req.scope).run({
      input: {
        selector: { id },
        update: updateData,
      },
    });

    res.json({
      success: true,
      product: result[0],
      message: "Product updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * DELETE /store/seller/products/[id]
 * Delete a product
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { sellerId } = req.body as { sellerId: string };

    if (!sellerId) {
      return res.status(400).json({
        error: "Missing required field: sellerId",
      });
    }

    // Verify seller owns this product
    const productModuleService = req.scope.resolve(Modules.PRODUCT);
    const product = await productModuleService.retrieveProduct(id);

    const metadata = product.metadata as any;
    if (metadata?.seller_id !== sellerId) {
      return res.status(403).json({
        error: "You do not have permission to delete this product",
      });
    }

    // Delete product
    await deleteProductsWorkflow(req.scope).run({
      input: { ids: [id] },
    });

    res.json({
      success: true,
      message: `Product ${id} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
