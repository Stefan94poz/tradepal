import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type ApproveVerificationStepInput = {
  profileId: string;
  profileType: "seller" | "buyer";
  approvedBy: string;
};

export const approveVerificationStep = createStep(
  "approve-verification-step",
  async (input: ApproveVerificationStepInput, { container }) => {
    const { profileId, profileType, approvedBy } = input;

    // Get the appropriate module service
    const moduleService =
      profileType === "seller"
        ? container.resolve("sellerModuleService")
        : container.resolve("buyerModuleService");

    // Approve verification
    const updatedProfile = await (moduleService as any).approveVerification(
      profileId,
      approvedBy
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
