import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { USER_PROFILE_MODULE } from "../../modules/user_profile";
import UserProfileModuleService from "../../modules/user_profile/service";

type SubmitVerificationInput = {
  userId: string;
  profileType: "seller" | "buyer";
  documentUrls: string[];
};

const submitVerificationStep = createStep(
  "submit-verification",
  async (input: SubmitVerificationInput, { container }) => {
    const userProfileService: UserProfileModuleService =
      container.resolve(USER_PROFILE_MODULE);

    const verification = await userProfileService.createVerificationDocuments({
      user_id: input.userId,
      profile_type: input.profileType,
      document_urls: input.documentUrls,
      status: "pending",
      submission_date: new Date(),
    });

    return new StepResponse(verification, verification.id);
  },
  async (verificationId, { container }) => {
    if (!verificationId) return;

    const userProfileService: UserProfileModuleService =
      container.resolve(USER_PROFILE_MODULE);

    await userProfileService.deleteVerificationDocuments(verificationId);
  }
);

export const submitVerificationWorkflow = createWorkflow(
  "submit-verification",
  (input: SubmitVerificationInput) => {
    const verification = submitVerificationStep(input);
    return new WorkflowResponse(verification);
  }
);
