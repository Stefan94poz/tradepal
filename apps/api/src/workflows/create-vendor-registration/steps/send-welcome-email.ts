import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export type SendWelcomeEmailStepInput = {
  vendorId: string;
  vendorName: string;
  adminEmail: string;
  adminName: string;
};

export const sendWelcomeEmailStep = createStep(
  "send-welcome-email",
  async (input: SendWelcomeEmailStepInput, { container }) => {
    const notificationModuleService = container.resolve(
      "notificationModuleService"
    );

    await notificationModuleService.createNotifications({
      to: input.adminEmail,
      channel: "email",
      template: "vendor-welcome",
      data: {
        vendor_name: input.vendorName,
        admin_name: input.adminName,
        dashboard_url: process.env.ADMIN_URL || "http://localhost:9000/app",
      },
    });

    return new StepResponse({ success: true });
  }
);
