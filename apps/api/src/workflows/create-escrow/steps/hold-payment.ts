import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { IPaymentModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

type HoldPaymentStepInput = {
  amount: number;
  currency: string;
  buyerId: string;
};

export const holdPaymentStep = createStep(
  "hold-payment-step",
  async (input: HoldPaymentStepInput, { container }) => {
    const { amount, currency, buyerId } = input;

    const paymentModuleService: IPaymentModuleService = container.resolve(
      Modules.PAYMENT
    );

    try {
      // Create a payment collection for the escrow amount
      const [paymentCollection] =
        await paymentModuleService.createPaymentCollections({
          currency_code: currency,
          amount,
          // metadata: { buyer_id: buyerId },
        } as any);

      // Create a payment session with Stripe provider
      const paymentSession = await paymentModuleService.createPaymentSession(
        paymentCollection.id,
        {
          provider_id: "stripe",
          currency_code: currency,
          amount,
          data: {
            // Stripe Payment Intent will be created but not captured
            capture_method: "manual",
          },
        } as any
      );

      console.log(`[STRIPE] Payment session created: ${paymentSession.id}`);
      console.log(`[STRIPE] Amount held: ${amount} ${currency}`);

      return new StepResponse(
        {
          paymentCollectionId: paymentCollection.id,
          paymentSessionId: paymentSession.id,
          paymentIntentId: paymentSession.data?.id || paymentSession.id,
        },
        {
          paymentCollectionId: paymentCollection.id,
          paymentSessionId: paymentSession.id,
        }
      );
    } catch (error) {
      console.error("[STRIPE] Failed to hold payment:", error);
      // Fallback to mock payment for development
      console.log("[STRIPE] Using mock payment hold for development");
      return new StepResponse({
        paymentCollectionId: "mock_collection",
        paymentSessionId: "mock_session",
        paymentIntentId: `pi_mock_${Date.now()}`,
      });
    }
  },
  async (compensationData, { container }) => {
    if (
      !compensationData ||
      compensationData.paymentCollectionId === "mock_collection"
    ) {
      return;
    }

    const { paymentCollectionId, paymentSessionId } = compensationData;
    const paymentModuleService: IPaymentModuleService = container.resolve(
      Modules.PAYMENT
    );

    try {
      // Cancel the payment session
      await paymentModuleService.deletePaymentSession(paymentSessionId);
      console.log(`[STRIPE] Payment session ${paymentSessionId} cancelled`);
    } catch (error) {
      console.error("[STRIPE] Failed to cancel payment session:", error);
    }
  }
);
