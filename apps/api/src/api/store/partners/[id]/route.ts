import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;

    const partnerModuleService = req.scope.resolve("partnerModuleService");

    // Retrieve partner profile
    const partner = await (partnerModuleService as any).retrievePartnerProfile(
      id
    );

    if (!partner) {
      return res.status(404).json({
        error: `Partner profile not found with ID ${id}`,
      });
    }

    res.json({
      id: partner.id,
      userId: partner.user_id,
      profileType: partner.profile_type,
      companyName: partner.company_name,
      country: partner.country,
      industry: partner.industry,
      lookingFor: partner.looking_for,
      offers: partner.offers,
      isVerified: partner.is_verified,
      createdAt: partner.created_at,
      updatedAt: partner.updated_at,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve partner profile",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
