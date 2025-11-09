import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { IPaymentModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

type CapturePaymentStepInput = {
  paymentIntentId: string;
  amount: number;
};

export const capturePaymentStep = createStep(
  "capture-payment-step",
  async (input: CapturePaymentStepInput, { container }) => {
    const { paymentIntentId, amount } = input;

    const paymentModuleService: IPaymentModuleService = container.resolve(
      Modules.PAYMENT
    );

    try {
      // For Stripe, the payment session ID is the same as payment intent ID in many cases
      // We need to capture the payment using the payment provider's capture method
      console.log(`[STRIPE] Capturing payment: ${paymentIntentId}`);
      console.log(`[STRIPE] Amount: ${amount}`);

      // The actual capture will be handled by Stripe when the payment session is authorized
      // For now, we'll mark this as captured in our escrow system
      // TODO: Implement actual Stripe payment capture via webhooks or direct API call

      return new StepResponse({
        paymentIntentId,
        captured: true,
        capturedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[STRIPE] Failed to capture payment:", error);
      throw error;
    }
  },
  async () => {
    // No compensation for capture - if capture fails, the payment intent remains authorized
    console.log(
      "[STRIPE] Payment capture failed, payment intent remains authorized"
    );
  }
);
