import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { B2B_PRODUCT_MODULE } from "../../modules/b2b_product";
import B2BProductConfigService from "../../modules/b2b_product/service";

type CreateB2BProductInput = {
  productId: string;
  minimumOrderQuantity?: number;
  leadTimeDays?: number;
  bulkPricingTiers?: Array<{ quantity: number; price: number }>;
  isB2bOnly?: boolean;
  moqUnit?: string;
  availabilityStatus?:
    | "in_stock"
    | "made_to_order"
    | "out_of_stock"
    | "discontinued";
};

const createB2BConfigStep = createStep(
  "create-b2b-product-config",
  async (input: CreateB2BProductInput, { container }) => {
    const b2bProductService: B2BProductConfigService =
      container.resolve(B2B_PRODUCT_MODULE);

    const config = await b2bProductService.createB2BProductConfigs({
      product_id: input.productId,
      minimum_order_quantity: input.minimumOrderQuantity || 1,
      lead_time_days: input.leadTimeDays || null,
      bulk_pricing_tiers: input.bulkPricingTiers || null,
      is_b2b_only: input.isB2bOnly || false,
      moq_unit: input.moqUnit || null,
      availability_status: input.availabilityStatus || "in_stock",
    });

    return new StepResponse(config, config.id);
  },
  async (configId, { container }) => {
    if (!configId) return;

    const b2bProductService: B2BProductConfigService =
      container.resolve(B2B_PRODUCT_MODULE);

    await b2bProductService.deleteB2BProductConfigs(configId);
  }
);

export const createB2BProductConfigWorkflow = createWorkflow(
  "create-b2b-product-config",
  (input: CreateB2BProductInput) => {
    const config = createB2BConfigStep(input);
    return new WorkflowResponse(config);
  }
);
