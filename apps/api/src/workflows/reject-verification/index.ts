import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { rejectVerificationStep } from "./steps/reject-verification";
import { notifyVerificationRejectedStep } from "./steps/notify-verification-rejected";

type RejectVerificationInput = {
  profileId: string;
  profileType: "seller" | "buyer";
  rejectedBy: string;
  reason: string;
};

export const rejectVerificationWorkflow = createWorkflow(
  "reject-verification",
  (input: RejectVerificationInput) => {
    // Step 1: Reject verification
    const verification = rejectVerificationStep(input);

    // Step 2: Notify user about rejection
    notifyVerificationRejectedStep({
      profileId: input.profileId,
      profileType: input.profileType,
      userId: verification.userId,
      reason: input.reason,
    });

    return new WorkflowResponse({
      verification,
    });
  }
);
