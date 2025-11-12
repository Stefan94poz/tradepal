import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createVendorStep } from "./steps/create-vendor";
import { createVendorAdminStep } from "./steps/create-vendor-admin";
import { sendWelcomeEmailStep } from "./steps/send-welcome-email";

export type CreateVendorRegistrationInput = {
  vendor: {
    handle: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    address: string;
    business_type: string;
    description?: string;
    logo?: string;
    website?: string;
    industries?: string[];
    certifications?: string[];
  };
  admin: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  };
};

export const createVendorRegistrationWorkflow = createWorkflow(
  "create-vendor-registration",
  (input: CreateVendorRegistrationInput) => {
    // Step 1: Create vendor profile
    const vendor = createVendorStep(input.vendor);

    // Step 2: Create vendor admin user
    const admin = createVendorAdminStep({
      vendorId: vendor.id,
      ...input.admin,
    });

    // Step 3: Send welcome email
    sendWelcomeEmailStep({
      vendorId: vendor.id,
      vendorName: vendor.name,
      adminEmail: input.admin.email,
      adminName: `${input.admin.first_name} ${input.admin.last_name}`,
    });

    return new WorkflowResponse({
      vendor,
      admin,
    });
  }
);
