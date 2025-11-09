import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type SubmitVerificationStepInput = {
  userId: string;
  profileType: "seller" | "buyer";
  verificationDocuments: string[];
};

export const submitVerificationStep = createStep(
  "submit-verification-step",
  async (input: SubmitVerificationStepInput, { container }) => {
    const { userId, profileType, verificationDocuments } = input;

    // Get the appropriate module service
    const moduleService =
      profileType === "seller"
        ? container.resolve("sellerModuleService")
        : container.resolve("buyerModuleService");

    // Update profile with verification documents and set status to pending
    const profiles = await (moduleService as any).listSellerProfiles({
      user_id: userId,
    });

    if (!profiles || profiles.length === 0) {
      throw new Error(`${profileType} profile not found for user ${userId}`);
    }

    const profile = profiles[0];

    // Submit verification
    const updatedProfile = await (moduleService as any).submitVerification(
      profile.id,
      verificationDocuments
    );

    return new StepResponse(
      {
        id: updatedProfile.id,
        userId: updatedProfile.user_id,
        profileType,
      },
      {
        profileId: updatedProfile.id,
        profileType,
        previousStatus: profile.verification_status,
        previousDocuments: profile.verification_documents,
      }
    );
  },
  async (compensateData, { container }) => {
    if (!compensateData) return;

    const { profileId, previousStatus, previousDocuments, profileType } = compensateData;

    // Rollback: Restore previous verification status and documents
    const moduleService =
      profileType === "seller"
        ? container.resolve("sellerModuleService")
        : container.resolve("buyerModuleService");

    await (moduleService as any).updateSellerProfiles({
      id: profileId,
      verification_status: previousStatus,
      verification_documents: previousDocuments,
    });
  }
);
