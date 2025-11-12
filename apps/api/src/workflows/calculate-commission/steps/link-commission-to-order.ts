import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export type LinkCommissionToOrderInput = {
  commission_id: string;
  order_id: string;
};

export const linkCommissionToOrderStep = createStep(
  "link-commission-to-order",
  async (input: LinkCommissionToOrderInput, { container }) => {
    const remoteLink = container.resolve("remoteLink");

    // Create link between commission and order
    await remoteLink.create({
      commissionModuleService: {
        commission_id: input.commission_id,
      },
      orderModuleService: {
        order_id: input.order_id,
      },
    });

    return new StepResponse(
      { success: true },
      {
        commission_id: input.commission_id,
        order_id: input.order_id,
      }
    );
  },
  async (data, { container }) => {
    if (!data) return;

    const remoteLink = container.resolve("remoteLink");

    // Rollback: Remove the link
    await remoteLink.dismiss({
      commissionModuleService: {
        commission_id: data.commission_id,
      },
      orderModuleService: {
        order_id: data.order_id,
      },
    });
  }
);
