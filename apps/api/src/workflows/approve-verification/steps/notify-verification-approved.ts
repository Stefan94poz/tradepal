import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { EmailService } from "../../../services/email";

type NotifyVerificationApprovedStepInput = {
  profileId: string;
  profileType: "seller" | "buyer";
  userId: string;
  userEmail?: string;
};

export const notifyVerificationApprovedStep = createStep(
  "notify-verification-approved-step",
  async (input: NotifyVerificationApprovedStepInput, { container }) => {
    const { profileId, profileType, userId, userEmail } = input;

    // Send email notification
    if (userEmail) {
      try {
        const emailService = new EmailService();
        await emailService.sendVerificationApproved(userEmail, profileType);
        console.log(`[EMAIL] Verification approved email sent to ${userEmail}`);
      } catch (error) {
        console.error("[EMAIL] Failed to send verification approved email:", error);
        // Don't throw - continue workflow even if email fails
      }
    } else {
      console.log(`[NOTIFICATION] Verification approved for ${profileType} profile ${profileId}`);
      console.log(`[NOTIFICATION] User email not provided, skipping email notification`);
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
