import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type RejectVerificationStepInput = {
  profileId: string;
  profileType: "seller" | "buyer";
  rejectedBy: string;
  reason: string;
};

export const rejectVerificationStep = createStep(
  "reject-verification-step",
  async (input: RejectVerificationStepInput, { container }) => {
    const { profileId, profileType, rejectedBy, reason } = input;

    // Get the appropriate module service
    const moduleService =
      profileType === "seller"
        ? container.resolve("sellerModuleService")
        : container.resolve("buyerModuleService");

    // Reject verification
    const updatedProfile = await (moduleService as any).rejectVerification(
      profileId,
      rejectedBy,
      reason
    );

    return new StepResponse(
      {
        id: updatedProfile.id,
        userId: updatedProfile.user_id,
        profileType,
      },
      {
        profileId: updatedProfile.id,
        previousStatus: "pending" as const,
      }
    );
  },
  async (compensateData, { container }) => {
    if (!compensateData) return;

    const { profileId, previousStatus } = compensateData;
    const profileType = (compensateData as any).profileType;

    // Rollback: Restore previous verification status
    const moduleService =
      profileType === "seller"
        ? container.resolve("sellerModuleService")
        : container.resolve("buyerModuleService");

    await (moduleService as any).updateSellerProfiles({
      id: profileId,
      verification_status: previousStatus,
    });
  }
);
