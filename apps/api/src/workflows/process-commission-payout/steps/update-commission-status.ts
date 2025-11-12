import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMMISSION_MODULE } from "../../../modules/commission";

export const updateCommissionStatusStep = createStep(
  "update-commission-status",
  async (payoutResult: any, { container }) => {
    if (!payoutResult.success || !payoutResult.commission_ids) {
      return new StepResponse({ updated: 0 });
    }

    const commissionModuleService = container.resolve(COMMISSION_MODULE);

    let updated = 0;
    for (const commission_id of payoutResult.commission_ids) {
      await commissionModuleService.markAsPaid(
        commission_id,
        payoutResult.payout_id
      );
      updated++;
    }

    return new StepResponse({ updated });
  }
);
