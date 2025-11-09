import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type NotifyEscrowReleasedStepInput = {
  escrowId: string;
  sellerId: string;
  amount: number;
  currency: string;
};

export const notifyEscrowReleasedStep = createStep(
  "notify-escrow-released-step",
  async (input: NotifyEscrowReleasedStepInput) => {
    const { escrowId, sellerId, amount, currency } = input;

    // TODO: Implement actual notification logic (email, in-app notification, etc.)
    // For now, just log the notification
    console.log(
      `[NOTIFICATION] Escrow released for seller ${sellerId}: ${amount} ${currency}, escrow ID: ${escrowId}`
    );

    return new StepResponse({
      notificationSent: true,
      timestamp: new Date().toISOString(),
    });
  }
);
