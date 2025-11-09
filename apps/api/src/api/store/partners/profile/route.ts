import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createPartnerProfileWorkflow } from "../../../../workflows/create-partner-profile";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      userId,
      profileType,
      companyName,
      country,
      industry,
      lookingFor,
      offers,
    } = req.body as {
      userId: string;
      profileType: "buyer" | "seller";
      companyName: string;
      country: string;
      industry: string;
      lookingFor: string[];
      offers: string[];
    };

    if (
      !userId ||
      !profileType ||
      !companyName ||
      !country ||
      !industry
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: userId, profileType, companyName, country, industry",
      });
    }

    if (profileType !== "seller" && profileType !== "buyer") {
      return res.status(400).json({
        error: "Invalid profileType. Must be 'seller' or 'buyer'",
      });
    }

    // Execute create partner profile workflow
    const { result } = await createPartnerProfileWorkflow(req.scope).run({
      input: {
        userId,
        profileType,
        companyName,
        country,
        industry,
        lookingFor: lookingFor || [],
        offers: offers || [],
      },
    });

    res.json({
      success: true,
      partner: result.partner,
      message: "Partner profile created successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create partner profile",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
