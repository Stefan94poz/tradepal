import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { rejectVerificationWorkflow } from "../../../../../workflows/reject-verification";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { profileType, rejectedBy, reason } = req.body as {
      profileType: "seller" | "buyer";
      rejectedBy: string;
      reason: string;
    };

    if (!profileType || !rejectedBy || !reason) {
      return res.status(400).json({
        error: "Missing required fields: profileType, rejectedBy, reason",
      });
    }

    if (profileType !== "seller" && profileType !== "buyer") {
      return res.status(400).json({
        error: "Invalid profileType. Must be 'seller' or 'buyer'",
      });
    }

    // Execute rejection workflow
    const { result } = await rejectVerificationWorkflow(req.scope).run({
      input: {
        profileId: id,
        profileType,
        rejectedBy,
        reason,
      },
    });

    res.json({
      success: true,
      verification: result.verification,
      message: `Verification rejected for ${profileType} profile ${id}`,
      reason,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to reject verification",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
