import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type NotifyVerificationSubmittedStepInput = {
  userId: string;
  profileType: "seller" | "buyer";
  verificationId: string;
};

export const notifyVerificationSubmittedStep = createStep(
  "notify-verification-submitted-step",
  async (input: NotifyVerificationSubmittedStepInput) => {
    const { userId, profileType, verificationId } = input;

    // TODO: Implement actual notification logic (email, in-app notification, etc.)
    // For now, just log the notification
    console.log(
      `[NOTIFICATION] Verification submitted for ${profileType} user ${userId}, verification ID: ${verificationId}`
    );

    return new StepResponse({
      notificationSent: true,
      timestamp: new Date().toISOString(),
    });
  }
);
