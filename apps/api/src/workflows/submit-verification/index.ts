import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { submitVerificationStep } from "./steps/submit-verification";
import { notifyVerificationSubmittedStep } from "./steps/notify-verification-submitted";

type SubmitVerificationInput = {
  userId: string;
  profileType: "seller" | "buyer";
  verificationDocuments: string[];
};

export const submitVerificationWorkflow = createWorkflow(
  "submit-verification",
  (input: SubmitVerificationInput) => {
    // Step 1: Submit verification documents
    const verification = submitVerificationStep(input);

    // Step 2: Notify admins about pending verification
    notifyVerificationSubmittedStep({
      userId: input.userId,
      profileType: input.profileType,
      verificationId: verification.id,
    });

    return new WorkflowResponse({
      verification,
    });
  }
);
