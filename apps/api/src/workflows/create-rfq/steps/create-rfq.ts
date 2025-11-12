import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { RFQ_MODULE } from "../../../modules/rfq";

export const createRFQStep = createStep(
  "create-rfq",
  async (input: any, { container }) => {
    const rfqModuleService = container.resolve(RFQ_MODULE);

    // Create RFQ
    const rfq = await rfqModuleService.createRFQ({
      buyer_id: input.buyer_id,
      buyer_company: input.buyer_company,
      buyer_email: input.buyer_email,
      buyer_phone: input.buyer_phone,
      title: input.title,
      description: input.description,
      product_details: input.product_details,
      quantity: input.quantity,
      target_price: input.target_price,
      total_budget: input.total_budget,
      delivery_deadline: input.delivery_deadline
        ? new Date(input.delivery_deadline)
        : undefined,
      valid_until: input.valid_until ? new Date(input.valid_until) : undefined,
      special_requirements: input.special_requirements,
      payment_terms: input.payment_terms,
    });

    // Publish if requested
    if (input.publish) {
      await rfqModuleService.publishRFQ(rfq.id);
    }

    return new StepResponse(rfq, rfq.id);
  },
  async (rfq_id, { container }) => {
    if (!rfq_id) return;

    const rfqModuleService = container.resolve(RFQ_MODULE);
    await rfqModuleService.deleteRFQs(rfq_id);
  }
);
