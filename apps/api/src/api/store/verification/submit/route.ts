import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { submitVerificationWorkflow } from "../../../../workflows/submit-verification";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { userId, profileType, verificationDocuments } = req.body as {
      userId: string;
      profileType: "seller" | "buyer";
      verificationDocuments: string[];
    };

    if (!userId || !profileType || !verificationDocuments) {
      return res.status(400).json({
        error:
          "Missing required fields: userId, profileType, verificationDocuments",
      });
    }

    if (profileType !== "seller" && profileType !== "buyer") {
      return res.status(400).json({
        error: "Invalid profileType. Must be 'seller' or 'buyer'",
      });
    }

    if (!Array.isArray(verificationDocuments) || verificationDocuments.length === 0) {
      return res.status(400).json({
        error: "verificationDocuments must be a non-empty array of document URLs",
      });
    }

    // Execute submit verification workflow
    const { result } = await submitVerificationWorkflow(req.scope).run({
      input: {
        userId,
        profileType,
        verificationDocuments,
      },
    });

    res.json({
      success: true,
      verification: result.verification,
      message: "Verification documents submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to submit verification",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
