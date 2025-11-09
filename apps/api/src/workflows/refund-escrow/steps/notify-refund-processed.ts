import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type NotifyRefundProcessedStepInput = {
  escrowId: string;
  buyerId: string;
  amount: number;
  currency: string;
};

export const notifyRefundProcessedStep = createStep(
  "notify-refund-processed-step",
  async (input: NotifyRefundProcessedStepInput) => {
    const { escrowId, buyerId, amount, currency } = input;

    // TODO: Implement actual notification logic (email, in-app notification, etc.)
    // For now, just log the notification
    console.log(
      `[NOTIFICATION] Refund processed for buyer ${buyerId}: ${amount} ${currency}, escrow ID: ${escrowId}`
    );

    return new StepResponse({
      notificationSent: true,
      timestamp: new Date().toISOString(),
    });
  }
);
