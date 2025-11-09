import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { EmailService } from "../../../services/email";

type NotifyBuyerOrderDeclinedStepInput = {
  orderId: string;
  buyerId: string;
  buyerEmail?: string;
  sellerId: string;
  reason: string;
};

export const notifyBuyerOrderDeclinedStep = createStep(
  "notify-buyer-order-declined-step",
  async (input: NotifyBuyerOrderDeclinedStepInput, { container }) => {
    const { orderId, buyerId, buyerEmail, sellerId, reason } = input;

    // Send email notification
    if (buyerEmail) {
      try {
        const emailService = new EmailService();
        await emailService.sendOrderDeclinedBuyer(buyerEmail, orderId, reason);
        console.log(`[EMAIL] Order declined email sent to ${buyerEmail}`);
      } catch (error) {
        console.error("[EMAIL] Failed to send order declined email:", error);
      }
    } else {
      console.log(`[NOTIFICATION] Order ${orderId} declined by seller ${sellerId}`);
      console.log(`[NOTIFICATION] Reason: ${reason}`);
      console.log(`[NOTIFICATION] Notifying buyer ${buyerId}`);
    }

    return new StepResponse({
      orderId,
      buyerId,
      notificationSent: true,
    });
  },
  async () => {
    // No compensation needed for notifications
  }
);
