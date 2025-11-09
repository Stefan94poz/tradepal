import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

type CreatePartnerProfileStepInput = {
  userId: string;
  profileType: "buyer" | "seller";
  companyName: string;
  country: string;
  industry: string;
  lookingFor: string[];
  offers: string[];
};

export const createPartnerProfileStep = createStep(
  "create-partner-profile-step",
  async (input: CreatePartnerProfileStepInput, { container }) => {
    const {
      userId,
      profileType,
      companyName,
      country,
      industry,
      lookingFor,
      offers,
    } = input;

    const partnerModuleService = container.resolve("partnerModuleService");

    // Create partner profile
    const partner = await (partnerModuleService as any).createPartnerProfiles({
      user_id: userId,
      profile_type: profileType,
      company_name: companyName,
      country,
      industry,
      looking_for: lookingFor,
      offers,
      is_verified: false, // Will be set to true when user is verified
    });

    return new StepResponse(
      {
        id: partner.id,
        userId: partner.user_id,
        companyName: partner.company_name,
      },
      {
        partnerId: partner.id,
      }
    );
  },
  async (compensateData, { container }) => {
    if (!compensateData) return;

    const { partnerId } = compensateData;

    // Rollback: Delete partner profile
    const partnerModuleService = container.resolve("partnerModuleService");

    await (partnerModuleService as any).deletePartnerProfiles(partnerId);

    console.log(`[PARTNER ROLLBACK] Deleted partner profile: ${partnerId}`);
  }
);
