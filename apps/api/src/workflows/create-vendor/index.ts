import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { validateVendorDataStep } from "./steps/validate-vendor-data";
import { createVendorStep } from "./steps/create-vendor";
import { createVendorAdminStep } from "./steps/create-vendor-admin";
import { linkVendorAdminToUserStep } from "./steps/link-vendor-admin-to-user";
import { sendVendorWelcomeEmailStep } from "./steps/send-welcome-email";
import { createStripeConnectAccountStep } from "./steps/create-stripe-connect-account";

export type CreateVendorInput = {
  handle: string;
  name: string;
  email: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  business_type: string;
  admin_email: string;
  admin_first_name?: string;
  admin_last_name?: string;
  admin_user_id?: string; // Optional: existing auth user ID
};

export const createVendorWorkflow = createWorkflow(
  "create-vendor",
  (input: CreateVendorInput) => {
    // Step 1: Validate vendor data (unique handle, valid email)
    validateVendorDataStep(input);

    // Step 2: Create vendor entity with default commission rate (5%)
    const vendor = createVendorStep(input);

    // Step 3: Create vendor admin user
    const vendorAdmin = createVendorAdminStep({
      vendor_id: vendor.id,
      email: input.admin_email,
      first_name: input.admin_first_name,
      last_name: input.admin_last_name,
    });

    // Step 4: Link vendor admin to auth user (if provided)
    if (input.admin_user_id) {
      linkVendorAdminToUserStep({
        vendor_admin_id: vendorAdmin.id,
        user_id: input.admin_user_id,
      });
    }

    // Step 5: Create Stripe Connect account (if enabled)
    const stripeAccount = createStripeConnectAccountStep({
      vendor_id: vendor.id,
      email: input.email,
      country: input.country,
      business_name: input.name,
    });

    // Step 6: Send welcome email with onboarding instructions
    sendVendorWelcomeEmailStep({
      vendor_id: vendor.id,
      email: input.email,
      name: input.name,
    });

    return new WorkflowResponse({
      vendor,
      vendorAdmin,
      connect_account_id: stripeAccount.connect_account_id,
    });
  }
);
