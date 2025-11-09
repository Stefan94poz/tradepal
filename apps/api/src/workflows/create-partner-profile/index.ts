import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createPartnerProfileStep } from "./steps/create-partner-profile";

type CreatePartnerProfileInput = {
  userId: string;
  profileType: "buyer" | "seller";
  companyName: string;
  country: string;
  industry: string;
  lookingFor: string[];
  offers: string[];
};

export const createPartnerProfileWorkflow = createWorkflow(
  "create-partner-profile",
  (input: CreatePartnerProfileInput) => {
    // Step 1: Create partner profile
    const partner = createPartnerProfileStep(input);

    return new WorkflowResponse({
      partner,
    });
  }
);
