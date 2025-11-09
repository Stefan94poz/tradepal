import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type NotifyVerificationApprovedStepInput = {
  userId: string;
  profileType: "seller" | "buyer";
  profileId: string;
};

export const notifyVerificationApprovedStep = createStep(
  "notify-verification-approved-step",
  async (input: NotifyVerificationApprovedStepInput) => {
    const { userId, profileType, profileId } = input;

    // TODO: Implement actual notification logic (email, in-app notification, etc.)
    // For now, just log the notification
    console.log(
      `[NOTIFICATION] Verification approved for ${profileType} user ${userId}, profile ID: ${profileId}`
    );

    return new StepResponse({
      notificationSent: true,
      timestamp: new Date().toISOString(),
    });
  }
);
