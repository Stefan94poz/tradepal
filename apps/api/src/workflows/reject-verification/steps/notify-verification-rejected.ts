import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type NotifyVerificationRejectedStepInput = {
  userId: string;
  profileType: "seller" | "buyer";
  profileId: string;
  reason: string;
};

export const notifyVerificationRejectedStep = createStep(
  "notify-verification-rejected-step",
  async (input: NotifyVerificationRejectedStepInput) => {
    const { userId, profileType, profileId, reason } = input;

    // TODO: Implement actual notification logic (email, in-app notification, etc.)
    // For now, just log the notification
    console.log(
      `[NOTIFICATION] Verification rejected for ${profileType} user ${userId}, profile ID: ${profileId}, reason: ${reason}`
    );

    return new StepResponse({
      notificationSent: true,
      timestamp: new Date().toISOString(),
    });
  }
);
