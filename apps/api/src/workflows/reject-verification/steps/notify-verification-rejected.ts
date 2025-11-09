import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { EmailService } from "../../../services/email";

type NotifyVerificationRejectedStepInput = {
  profileId: string;
  profileType: "seller" | "buyer";
  userId: string;
  userEmail?: string;
  reason: string;
};

export const notifyVerificationRejectedStep = createStep(
  "notify-verification-rejected-step",
  async (input: NotifyVerificationRejectedStepInput, { container }) => {
    const { profileId, profileType, userId, userEmail, reason } = input;

    // Send email notification
    if (userEmail) {
      try {
        const emailService = new EmailService();
        await emailService.sendVerificationRejected(
          userEmail,
          profileType,
          reason
        );
        console.log(`[EMAIL] Verification rejected email sent to ${userEmail}`);
      } catch (error) {
        console.error(
          "[EMAIL] Failed to send verification rejected email:",
          error
        );
        // Don't throw - continue workflow even if email fails
      }
    } else {
      console.log(
        `[NOTIFICATION] Verification rejected for ${profileType} profile ${profileId}`
      );
      console.log(`[NOTIFICATION] Reason: ${reason}`);
      console.log(
        `[NOTIFICATION] User email not provided, skipping email notification`
      );
    }

    return new StepResponse({
      profileId,
      userId,
      notificationSent: true,
    });
  },
  async () => {
    // No compensation needed for notifications
  }
);
