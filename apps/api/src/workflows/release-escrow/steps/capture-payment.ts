import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type CapturePaymentStepInput = {
  paymentIntentId: string;
  amount: number;
};

export const capturePaymentStep = createStep(
  "capture-payment-step",
  async (input: CapturePaymentStepInput) => {
    const { paymentIntentId, amount } = input;

    // TODO: Integrate with actual payment provider (Stripe, etc.)
    // For now, simulate payment capture
    console.log(
      `[PAYMENT] Capturing payment ${paymentIntentId} for amount ${amount}`
    );

    return new StepResponse(
      {
        paymentIntentId,
        amount,
        status: "captured",
        capturedAt: new Date().toISOString(),
      },
      {
        paymentIntentId,
        amount,
      }
    );
  },
  async (compensateData) => {
    if (!compensateData) return;

    const { paymentIntentId, amount } = compensateData;

    // Rollback: Refund captured payment
    console.log(
      `[PAYMENT ROLLBACK] Refunding captured payment ${paymentIntentId} for amount ${amount}`
    );

    // TODO: Implement actual payment refund with payment provider
  }
);
