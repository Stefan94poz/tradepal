import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMMISSION_MODULE } from "../../../modules/commission";

export const createCommissionRecordsStep = createStep(
  "create-commission-records",
  async (commissionsData: any[], { container }) => {
    const commissionModuleService = container.resolve(COMMISSION_MODULE);

    const createdCommissions: any[] = [];

    for (const data of commissionsData) {
      const commission =
        await commissionModuleService.calculateCommission(data);
      createdCommissions.push(commission);
    }

    return new StepResponse(
      createdCommissions,
      createdCommissions.map((c) => c.id)
    );
  },
  async (commissionIds, { container }) => {
    if (!commissionIds || commissionIds.length === 0) return;

    const commissionModuleService = container.resolve(COMMISSION_MODULE);

    // Delete commissions on rollback
    for (const id of commissionIds) {
      await commissionModuleService.deleteCommissions(id);
    }
  }
);
