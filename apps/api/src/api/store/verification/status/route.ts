import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { userId, profileType } = req.query as {
      userId?: string;
      profileType?: "seller" | "buyer";
    };

    if (!userId || !profileType) {
      return res.status(400).json({
        error: "Missing required query parameters: userId, profileType",
      });
    }

    if (profileType !== "seller" && profileType !== "buyer") {
      return res.status(400).json({
        error: "Invalid profileType. Must be 'seller' or 'buyer'",
      });
    }

    // Get the appropriate module service
    const moduleService =
      profileType === "seller"
        ? req.scope.resolve("sellerModuleService")
        : req.scope.resolve("buyerModuleService");

    // Retrieve profile
    const profiles = await (moduleService as any).listSellerProfiles({
      user_id: userId,
    });

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        error: `${profileType} profile not found for user ${userId}`,
      });
    }

    const profile = profiles[0];

    res.json({
      profileId: profile.id,
      userId: profile.user_id,
      profileType,
      companyName: profile.company_name,
      verificationStatus: profile.verification_status,
      verificationDocuments: profile.verification_documents,
      submittedAt: profile.updated_at,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve verification status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
