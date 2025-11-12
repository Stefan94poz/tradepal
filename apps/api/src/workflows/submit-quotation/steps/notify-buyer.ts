import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { RFQ_MODULE } from "../../../modules/rfq";

export const notifyBuyerStep = createStep(
  "notify-buyer",
  async (
    input: { rfq_id: string; quotation_id: string; vendor_id: string },
    { container }
  ) => {
    const rfqModuleService = container.resolve(RFQ_MODULE);

    // Get RFQ to get buyer info
    const rfq = await rfqModuleService.retrieveRFQ(input.rfq_id);

    console.log(
      `New quotation ${input.quotation_id} submitted for RFQ ${input.rfq_id} - buyer will be notified at ${rfq.buyer_email}`
    );

    // TODO: Send email notification to buyer
    // TODO: Create in-app notification

    return new StepResponse({ success: true });
  }
);
