import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type NotifyAdminDisputeStepInput = {
  escrowId: string;
  disputedBy: string;
  reason: string;
  orderId: string;
};

export const notifyAdminDisputeStep = createStep(
  "notify-admin-dispute-step",
  async (input: NotifyAdminDisputeStepInput) => {
    const { escrowId, disputedBy, reason, orderId } = input;

    // TODO: Implement actual notification logic (email, in-app notification, etc.)
    // For now, just log the notification
    console.log(
      `[ADMIN NOTIFICATION] Escrow dispute flagged by ${disputedBy} for escrow ${escrowId}, order ${orderId}, reason: ${reason}`
    );

    return new StepResponse({
      notificationSent: true,
      timestamp: new Date().toISOString(),
    });
  }
);
