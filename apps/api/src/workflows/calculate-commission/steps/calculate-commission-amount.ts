import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMMISSION_MODULE } from "../../../modules/commission";

export type CalculateCommissionAmountInput = {
  vendor_id: string;
  order_id: string;
  order_total: number;
  commission_rate: number;
  currency_code: string;
};

export const calculateCommissionAmountStep = createStep(
  "calculate-commission-amount",
  async (input: CalculateCommissionAmountInput, { container }) => {
    const commissionModuleService = container.resolve(COMMISSION_MODULE);

    // Calculate commission using the service method
    const commission = await commissionModuleService.calculateCommission({
      vendor_id: input.vendor_id,
      order_id: input.order_id,
      order_total: input.order_total,
      commission_rate: input.commission_rate,
      currency_code: input.currency_code,
    });

    return new StepResponse(
      {
        commission_id: commission.id,
        commission_amount: commission.commission_amount,
        net_amount: commission.net_amount,
      },
      {
        commission_id: commission.id,
      }
    );
  },
  async (data, { container }) => {
    if (!data) return;

    const commissionModuleService = container.resolve(COMMISSION_MODULE);

    // Rollback: Delete the commission record
    await commissionModuleService.deleteCommissions([data.commission_id]);
  }
);
