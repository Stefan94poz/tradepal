import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { approveVerificationWorkflow } from "../../../../../workflows/approve-verification";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { profileType, approvedBy } = req.body as {
      profileType: "seller" | "buyer";
      approvedBy: string;
    };

    if (!profileType || !approvedBy) {
      return res.status(400).json({
        error: "Missing required fields: profileType, approvedBy",
      });
    }

    if (profileType !== "seller" && profileType !== "buyer") {
      return res.status(400).json({
        error: "Invalid profileType. Must be 'seller' or 'buyer'",
      });
    }

    // Execute approval workflow
    const { result } = await approveVerificationWorkflow(req.scope).run({
      input: {
        profileId: id,
        profileType,
        approvedBy,
      },
    });

    res.json({
      success: true,
      verification: result.verification,
      message: `Verification approved for ${profileType} profile ${id}`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to approve verification",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
