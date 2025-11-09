import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { B2B_PRODUCT_MODULE } from "../../modules/b2b-product";
import B2BProductConfigService from "../../modules/b2b-product/service";

type UpdateB2BProductInput = {
  productId: string;
  minimumOrderQuantity?: number;
  leadTimeDays?: number;
  bulkPricingTiers?: Array<{ quantity: number; price: number }>;
  moqUnit?: string;
  availabilityStatus?:
    | "in_stock"
    | "made_to_order"
    | "out_of_stock"
    | "discontinued";
};

const updateB2BConfigStep = createStep(
  "update-b2b-product-config",
  async (input: UpdateB2BProductInput, { container }) => {
    const b2bProductService: B2BProductConfigService =
      container.resolve(B2B_PRODUCT_MODULE);

    // Find existing config
    const [configs] = await b2bProductService.listB2BProductConfigs({
      product_id: input.productId,
    });

    if (!configs || configs.length === 0) {
      throw new Error(`B2B config not found for product ${input.productId}`);
    }

    const config = configs[0];
    const updateData: any = {};

    if (input.minimumOrderQuantity !== undefined) {
      updateData.minimum_order_quantity = input.minimumOrderQuantity;
    }
    if (input.leadTimeDays !== undefined) {
      updateData.lead_time_days = input.leadTimeDays;
    }
    if (input.bulkPricingTiers !== undefined) {
      updateData.bulk_pricing_tiers = input.bulkPricingTiers;
    }
    if (input.moqUnit !== undefined) {
      updateData.moq_unit = input.moqUnit;
    }
    if (input.availabilityStatus !== undefined) {
      updateData.availability_status = input.availabilityStatus;
    }

    const updated = await b2bProductService.updateB2BProductConfigs({
      selector: { id: config.id },
      data: updateData,
    });

    return new StepResponse(updated[0], config);
  },
  async (originalConfig, { container }) => {
    if (!originalConfig) return;

    const b2bProductService: B2BProductConfigService =
      container.resolve(B2B_PRODUCT_MODULE);

    // Rollback to original values
    await b2bProductService.updateB2BProductConfigs({
      selector: { id: originalConfig.id },
      data: {
        minimum_order_quantity: originalConfig.minimum_order_quantity,
        lead_time_days: originalConfig.lead_time_days,
        bulk_pricing_tiers: originalConfig.bulk_pricing_tiers,
        moq_unit: originalConfig.moq_unit,
        availability_status: originalConfig.availability_status,
      },
    });
  }
);

export const updateB2BProductConfigWorkflow = createWorkflow(
  "update-b2b-product-config",
  (input: UpdateB2BProductInput) => {
    const config = updateB2BConfigStep(input);
    return new WorkflowResponse(config);
  }
);
