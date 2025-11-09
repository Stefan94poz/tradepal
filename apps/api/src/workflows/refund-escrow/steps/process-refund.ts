import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { IPaymentModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

type ProcessRefundStepInput = {
  paymentIntentId: string;
  amount: number;
  reason: string;
};

export const processRefundStep = createStep(
  "process-refund-step",
  async (input: ProcessRefundStepInput, { container }) => {
    const { paymentIntentId, amount, reason } = input;

    const paymentModuleService: IPaymentModuleService =
      container.resolve(Modules.PAYMENT);

    try {
      console.log(`[STRIPE] Processing refund for payment: ${paymentIntentId}`);
      console.log(`[STRIPE] Amount: ${amount}`);
      console.log(`[STRIPE] Reason: ${reason}`);

      // TODO: Implement actual Stripe refund via Payment Module or direct Stripe API
      // For now, log the refund request
      // In production, this should call Stripe's refund API

      return new StepResponse({
        paymentIntentId,
        refunded: true,
        refundedAt: new Date().toISOString(),
        refundReason: reason,
      });
    } catch (error) {
      console.error("[STRIPE] Failed to process refund:", error);
      throw error;
    }
  },
  async () => {
    // No compensation for refund - once refunded, it's final
    console.log("[STRIPE] Refund cannot be rolled back");
  }
);
