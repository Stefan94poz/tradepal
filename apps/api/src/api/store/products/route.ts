import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { createB2BProductConfigWorkflow } from "../../../../workflows/product/create-b2b-config";

type CreateProductRequest = {
  title: string;
  description?: string;
  handle?: string;
  status?: "draft" | "published";
  thumbnail?: string;
  images?: string[];
  options?: Array<{ title: string; values: string[] }>;
  variants?: Array<{
    title: string;
    prices: Array<{ amount: number; currency_code: string }>;
    options?: Record<string, string>;
    inventory_quantity?: number;
  }>;
  // B2B-specific fields
  minimum_order_quantity?: number;
  lead_time_days?: number;
  bulk_pricing_tiers?: Array<{ quantity: number; price: number }>;
  is_b2b_only?: boolean;
  moq_unit?: string;
};

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateProductRequest>,
  res: MedusaResponse
) => {
  const userId = req.auth_context?.actor_id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // TODO: Verify user is a verified seller
  // TODO: Use Medusa product service to create product
  // For now, we'll just create the B2B config placeholder

  const mockProductId = `prod_${Date.now()}`;

  // Create B2B configuration for the product
  const { result: b2bConfig } = await createB2BProductConfigWorkflow(
    req.scope
  ).run({
    input: {
      productId: mockProductId,
      minimumOrderQuantity: req.validatedBody.minimum_order_quantity,
      leadTimeDays: req.validatedBody.lead_time_days,
      bulkPricingTiers: req.validatedBody.bulk_pricing_tiers,
      isB2bOnly: req.validatedBody.is_b2b_only,
      moqUnit: req.validatedBody.moq_unit,
    },
  });

  res.json({
    product: {
      id: mockProductId,
      ...req.validatedBody,
      seller_id: userId,
    },
    b2b_config: b2bConfig,
    message:
      "Product created successfully (TODO: integrate with Medusa product service)",
  });
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const userId = req.auth_context?.actor_id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // TODO: Fetch products where seller_id = userId
  // TODO: Join with B2B config data

  res.json({
    products: [],
    count: 0,
    message: "TODO: Implement product listing with Medusa product service",
  });
};
