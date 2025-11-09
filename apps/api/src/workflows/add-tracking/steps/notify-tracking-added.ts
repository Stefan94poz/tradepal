import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type NotifyTrackingAddedStepInput = {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  trackingId: string;
};

export const notifyTrackingAddedStep = createStep(
  "notify-tracking-added-step",
  async (input: NotifyTrackingAddedStepInput) => {
    const { orderId, trackingNumber, carrier, trackingId } = input;

    // TODO: Implement actual notification logic (email, in-app notification, etc.)
    // For now, just log the notification
    console.log(
      `[NOTIFICATION] Tracking added for order ${orderId}: ${carrier} ${trackingNumber}, tracking ID: ${trackingId}`
    );

    return new StepResponse({
      notificationSent: true,
      timestamp: new Date().toISOString(),
    });
  }
);
