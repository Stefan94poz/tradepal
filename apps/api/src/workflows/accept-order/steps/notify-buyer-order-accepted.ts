import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { EmailService } from "../../../services/email";

type NotifyBuyerOrderAcceptedStepInput = {
  orderId: string;
  buyerId: string;
  buyerEmail?: string;
  vendorId: string; // Changed from sellerId
};

export const notifyBuyerOrderAcceptedStep = createStep(
  "notify-buyer-order-accepted-step",
  async (input: NotifyBuyerOrderAcceptedStepInput, { container }) => {
    const { orderId, buyerId, buyerEmail, vendorId } = input;

    // Send email notification
    if (buyerEmail) {
      try {
        const emailService = new EmailService();
        const orderUrl = `${process.env.STORE_URL || "http://localhost:3000"}/orders/${orderId}`;
        await emailService.sendOrderAcceptedBuyer(
          buyerEmail,
          orderId,
          orderUrl
        );
        console.log(`[EMAIL] Order accepted email sent to ${buyerEmail}`);
      } catch (error) {
        console.error("[EMAIL] Failed to send order accepted email:", error);
      }
    } else {
      console.log(
        `[NOTIFICATION] Order ${orderId} accepted by vendor ${vendorId}`
      );
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
