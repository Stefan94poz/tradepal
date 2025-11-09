import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { EmailService } from "../../../services/email";

type NotifyTrackingAddedStepInput = {
  orderId: string;
  buyerEmail?: string;
  trackingNumber: string;
  carrier: string;
  trackingId: string;
};

export const notifyTrackingAddedStep = createStep(
  "notify-tracking-added-step",
  async (input: NotifyTrackingAddedStepInput, { container }) => {
    const { orderId, buyerEmail, trackingNumber, carrier, trackingId } = input;

    // Send email notification
    if (buyerEmail) {
      try {
        const emailService = new EmailService();
        const trackingUrl = `${process.env.STORE_URL || "http://localhost:3000"}/orders/${orderId}/tracking`;
        await emailService.sendTrackingAdded(
          buyerEmail,
          orderId,
          carrier,
          trackingNumber,
          trackingUrl
        );
        console.log(`[EMAIL] Tracking added email sent to ${buyerEmail}`);
      } catch (error) {
        console.error("[EMAIL] Failed to send tracking added email:", error);
      }
    } else {
      console.log(`[NOTIFICATION] Tracking added for order ${orderId}`);
      console.log(
        `[NOTIFICATION] Carrier: ${carrier}, Tracking: ${trackingNumber}`
      );
    }

    return new StepResponse({
      orderId,
      trackingId,
      notificationSent: true,
    });
  },
  async () => {
    // No compensation needed for notifications
  }
);
