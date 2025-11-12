import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type SendVendorWelcomeEmailInput = {
  vendor_id: string;
  email: string;
  name: string;
};

export const sendVendorWelcomeEmailStep = createStep(
  "send-vendor-welcome-email",
  async (input: SendVendorWelcomeEmailInput, { container }) => {
    // TODO: Integrate with email service (SendGrid)
    // For now, just log the email
    console.log("Sending welcome email to vendor:", {
      vendor_id: input.vendor_id,
      email: input.email,
      name: input.name,
    });

    // Email content:
    // - Welcome to TradePal marketplace
    // - Next steps for verification
    // - How to add products
    // - Commission structure
    // - Support contact information

    return new StepResponse({ email_sent: true });
  }
);
