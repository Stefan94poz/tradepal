import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const sellerModuleService = req.scope.resolve("sellerModuleService");
    const buyerModuleService = req.scope.resolve("buyerModuleService");

    // Get all pending seller verifications
    const pendingSellerProfiles = await (
      sellerModuleService as any
    ).listSellerProfiles({
      verification_status: "pending",
    });

    // Get all pending buyer verifications
    const pendingBuyerProfiles = await (
      buyerModuleService as any
    ).listBuyerProfiles({
      verification_status: "pending",
    });

    // Combine and format results
    const verifications = [
      ...pendingSellerProfiles.map((profile: any) => ({
        id: profile.id,
        userId: profile.user_id,
        profileType: "seller",
        companyName: profile.company_name,
        businessType: profile.business_type,
        country: profile.country,
        city: profile.city,
        verificationStatus: profile.verification_status,
        verificationDocuments: profile.verification_documents,
        createdAt: profile.created_at,
      })),
      ...pendingBuyerProfiles.map((profile: any) => ({
        id: profile.id,
        userId: profile.user_id,
        profileType: "buyer",
        companyName: profile.company_name,
        businessInterests: profile.business_interests,
        country: profile.country,
        city: profile.city,
        verificationStatus: profile.verification_status,
        verificationDocuments: profile.verification_documents,
        createdAt: profile.created_at,
      })),
    ];

    // Sort by creation date (newest first)
    verifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      verifications,
      count: verifications.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve pending verifications",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
