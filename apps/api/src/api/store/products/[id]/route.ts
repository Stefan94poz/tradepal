import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { updateB2BProductConfigWorkflow } from "../../../../../workflows/product/update-b2b-config";

type UpdateProductRequest = {
  title?: string;
  description?: string;
  status?: "draft" | "published";
  thumbnail?: string;
  // B2B-specific fields
  minimum_order_quantity?: number;
  lead_time_days?: number;
  bulk_pricing_tiers?: Array<{ quantity: number; price: number }>;
  moq_unit?: string;
  availability_status?:
    | "in_stock"
    | "made_to_order"
    | "out_of_stock"
    | "discontinued";
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id: productId } = req.params;

  // TODO: Fetch product with B2B config
  // TODO: Verify user has access to this product

  res.json({
    product: null,
    message: "TODO: Implement product retrieval",
  });
};

export const PUT = async (
  req: AuthenticatedMedusaRequest<UpdateProductRequest>,
  res: MedusaResponse
) => {
  const { id: productId } = req.params;
  const userId = req.auth_context?.actor_id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // TODO: Verify user owns this product
  // TODO: Update Medusa product

  // Update B2B configuration
  if (
    req.validatedBody.minimum_order_quantity !== undefined ||
    req.validatedBody.lead_time_days !== undefined ||
    req.validatedBody.bulk_pricing_tiers !== undefined ||
    req.validatedBody.moq_unit !== undefined ||
    req.validatedBody.availability_status !== undefined
  ) {
    const { result: b2bConfig } = await updateB2BProductConfigWorkflow(
      req.scope
    ).run({
      input: {
        productId,
        minimumOrderQuantity: req.validatedBody.minimum_order_quantity,
        leadTimeDays: req.validatedBody.lead_time_days,
        bulkPricingTiers: req.validatedBody.bulk_pricing_tiers,
        moqUnit: req.validatedBody.moq_unit,
        availabilityStatus: req.validatedBody.availability_status,
      },
    });

    res.json({
      product: {
        id: productId,
        ...req.validatedBody,
      },
      b2b_config: b2bConfig,
      message: "Product updated successfully",
    });
  } else {
    res.json({
      product: {
        id: productId,
        ...req.validatedBody,
      },
      message: "Product updated (no B2B config changes)",
    });
  }
};

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id: productId } = req.params;
  const userId = req.auth_context?.actor_id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // TODO: Verify user owns this product
  // TODO: Soft delete product in Medusa
  // B2B config will be cascade deleted via foreign key

  res.json({
    id: productId,
    deleted: true,
    message: "TODO: Implement product deletion",
  });
};
