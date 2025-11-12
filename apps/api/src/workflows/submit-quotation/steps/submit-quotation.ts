import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { RFQ_MODULE } from "../../../modules/rfq";
import { VENDOR_MODULE } from "../../../modules/vendor";

export const submitQuotationStep = createStep(
  "submit-quotation",
  async (input: any, { container }) => {
    const rfqModuleService = container.resolve(RFQ_MODULE);
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    // Validate vendor exists and is active
    const vendor = await vendorModuleService.retrieveVendor(input.vendor_id);

    if (!vendor || !vendor.is_active) {
      throw new Error("Vendor is not active or not found");
    }

    // Validate RFQ exists and is published
    const rfq = await rfqModuleService.retrieveRFQ(input.rfq_id);

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    if (rfq.status !== "published" && rfq.status !== "quoted") {
      throw new Error("RFQ is not accepting quotations");
    }

    // Submit quotation
    const quotation = await rfqModuleService.submitQuotation({
      rfq_id: input.rfq_id,
      vendor_id: input.vendor_id,
      quoted_price: input.quoted_price,
      total_price: input.total_price,
      lead_time_days: input.lead_time_days,
      minimum_order_quantity: input.minimum_order_quantity,
      validity_days: input.validity_days || 30,
      payment_terms: input.payment_terms,
      delivery_terms: input.delivery_terms,
      notes: input.notes,
    });

    return new StepResponse(quotation, quotation.id);
  },
  async (quotation_id, { container }) => {
    if (!quotation_id) return;

    const rfqModuleService = container.resolve(RFQ_MODULE);
    await rfqModuleService.deleteRFQQuotations(quotation_id);
  }
);
