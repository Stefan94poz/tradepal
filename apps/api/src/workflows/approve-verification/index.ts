import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { approveVerificationStep } from "./steps/approve-verification";
import { notifyVerificationApprovedStep } from "./steps/notify-verification-approved";

type ApproveVerificationInput = {
  profileId: string;
  profileType: "seller" | "buyer";
  approvedBy: string;
};

export const approveVerificationWorkflow = createWorkflow(
  "approve-verification",
  (input: ApproveVerificationInput) => {
    // Step 1: Approve verification
    const verification = approveVerificationStep(input);

    // Step 2: Notify user about approval
    notifyVerificationApprovedStep({
      profileId: input.profileId,
      profileType: input.profileType,
      userId: verification.userId,
    });

    return new WorkflowResponse({
      verification,
    });
  }
);
