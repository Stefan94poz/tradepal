import sgMail from "@sendgrid/mail";

/**
 * Email Service using SendGrid
 * Handles all email notifications for the platform
 */

// Initialize SendGrid with API key from environment
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const SENDGRID_FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || "noreply@tradepal.com";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export type EmailTemplate =
  | "verification-submitted"
  | "verification-approved"
  | "verification-rejected"
  | "order-created-seller"
  | "order-accepted-buyer"
  | "order-declined-buyer"
  | "escrow-created"
  | "escrow-released"
  | "escrow-disputed"
  | "tracking-added";

interface EmailData {
  to: string;
  subject: string;
  template: EmailTemplate;
  dynamicData: Record<string, any>;
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(data: EmailData): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn(
      "[EMAIL SERVICE] SendGrid API key not configured. Email not sent."
    );
    console.log(
      `[EMAIL SERVICE] Would send email to ${data.to}: ${data.subject}`
    );
    return;
  }

  try {
    const msg = {
      to: data.to,
      from: SENDGRID_FROM_EMAIL,
      subject: data.subject,
      html: renderEmailTemplate(data.template, data.dynamicData),
    };

    await sgMail.send(msg);
    console.log(`[EMAIL SERVICE] Email sent successfully to ${data.to}`);
  } catch (error) {
    console.error("[EMAIL SERVICE] Failed to send email:", error);
    throw error;
  }
}

/**
 * Render email template with dynamic data
 * TODO: Replace with SendGrid Dynamic Templates for production
 */
function renderEmailTemplate(
  template: EmailTemplate,
  data: Record<string, any>
): string {
  const templates: Record<EmailTemplate, (data: any) => string> = {
    "verification-submitted": (d) => `
      <h1>Verification Submitted</h1>
      <p>Hello,</p>
      <p>Your verification documents have been submitted for review.</p>
      <p>Profile Type: <strong>${d.profileType}</strong></p>
      <p>We will review your documents and notify you of the result within 1-2 business days.</p>
      <p>Thank you,<br>TradePal Team</p>
    `,
    "verification-approved": (d) => `
      <h1>Verification Approved ✓</h1>
      <p>Hello,</p>
      <p>Congratulations! Your ${d.profileType} account has been verified.</p>
      <p>You can now access all platform features.</p>
      <p>Thank you,<br>TradePal Team</p>
    `,
    "verification-rejected": (d) => `
      <h1>Verification Rejected</h1>
      <p>Hello,</p>
      <p>We were unable to verify your ${d.profileType} account at this time.</p>
      <p><strong>Reason:</strong> ${d.reason}</p>
      <p>Please resubmit your verification documents with the necessary corrections.</p>
      <p>Thank you,<br>TradePal Team</p>
    `,
    "order-created-seller": (d) => `
      <h1>New Order Received</h1>
      <p>Hello Seller,</p>
      <p>You have received a new order <strong>#${d.orderId}</strong></p>
      <p>Please review and accept or decline the order in your dashboard.</p>
      <p><a href="${d.dashboardUrl}">View Order</a></p>
      <p>Thank you,<br>TradePal Team</p>
    `,
    "order-accepted-buyer": (d) => `
      <h1>Order Accepted</h1>
      <p>Hello,</p>
      <p>Your order <strong>#${d.orderId}</strong> has been accepted by the seller.</p>
      <p>Payment escrow has been created. You will receive tracking information once the seller ships your order.</p>
      <p><a href="${d.orderUrl}">View Order Details</a></p>
      <p>Thank you,<br>TradePal Team</p>
    `,
    "order-declined-buyer": (d) => `
      <h1>Order Declined</h1>
      <p>Hello,</p>
      <p>Unfortunately, your order <strong>#${d.orderId}</strong> has been declined by the seller.</p>
      <p><strong>Reason:</strong> ${d.reason}</p>
      <p>You can browse other sellers or contact this seller for more information.</p>
      <p>Thank you,<br>TradePal Team</p>
    `,
    "escrow-created": (d) => `
      <h1>Escrow Payment Held</h1>
      <p>Hello,</p>
      <p>Payment for order <strong>#${d.orderId}</strong> is now held in escrow.</p>
      <p>Amount: <strong>${d.amount} ${d.currency}</strong></p>
      <p>The payment will be released to the seller once you confirm delivery.</p>
      <p>Thank you,<br>TradePal Team</p>
    `,
    "escrow-released": (d) => `
      <h1>Payment Released</h1>
      <p>Hello Seller,</p>
      <p>The escrow payment for order <strong>#${d.orderId}</strong> has been released.</p>
      <p>Amount: <strong>${d.amount} ${d.currency}</strong></p>
      <p>Funds will be transferred to your account according to your payment schedule.</p>
      <p>Thank you,<br>TradePal Team</p>
    `,
    "escrow-disputed": (d) => `
      <h1>Escrow Dispute Flagged</h1>
      <p>Hello Admin,</p>
      <p>A dispute has been flagged for order <strong>#${d.orderId}</strong></p>
      <p><strong>Disputed by:</strong> ${d.disputedBy}</p>
      <p><strong>Reason:</strong> ${d.reason}</p>
      <p>Please review and resolve this dispute in the admin dashboard.</p>
      <p><a href="${d.adminUrl}">Review Dispute</a></p>
      <p>TradePal System</p>
    `,
    "tracking-added": (d) => `
      <h1>Shipment Tracking Available</h1>
      <p>Hello,</p>
      <p>Your order <strong>#${d.orderId}</strong> has been shipped!</p>
      <p><strong>Carrier:</strong> ${d.carrier}</p>
      <p><strong>Tracking Number:</strong> ${d.trackingNumber}</p>
      <p>You can track your shipment in your order details page.</p>
      <p><a href="${d.trackingUrl}">Track Shipment</a></p>
      <p>Thank you,<br>TradePal Team</p>
    `,
  };

  return templates[template](data);
}

/**
 * Email Service Class (for registration in Medusa container)
 */
export class EmailService {
  async sendVerificationSubmitted(email: string, profileType: string) {
    return sendEmail({
      to: email,
      subject: "Verification Submitted - TradePal",
      template: "verification-submitted",
      dynamicData: { profileType },
    });
  }

  async sendVerificationApproved(email: string, profileType: string) {
    return sendEmail({
      to: email,
      subject: "Verification Approved - TradePal",
      template: "verification-approved",
      dynamicData: { profileType },
    });
  }

  async sendVerificationRejected(
    email: string,
    profileType: string,
    reason: string
  ) {
    return sendEmail({
      to: email,
      subject: "Verification Rejected - TradePal",
      template: "verification-rejected",
      dynamicData: { profileType, reason },
    });
  }

  async sendOrderCreatedSeller(
    email: string,
    orderId: string,
    dashboardUrl: string
  ) {
    return sendEmail({
      to: email,
      subject: `New Order #${orderId} - TradePal`,
      template: "order-created-seller",
      dynamicData: { orderId, dashboardUrl },
    });
  }

  async sendOrderAcceptedBuyer(
    email: string,
    orderId: string,
    orderUrl: string
  ) {
    return sendEmail({
      to: email,
      subject: `Order #${orderId} Accepted - TradePal`,
      template: "order-accepted-buyer",
      dynamicData: { orderId, orderUrl },
    });
  }

  async sendOrderDeclinedBuyer(email: string, orderId: string, reason: string) {
    return sendEmail({
      to: email,
      subject: `Order #${orderId} Declined - TradePal`,
      template: "order-declined-buyer",
      dynamicData: { orderId, reason },
    });
  }

  async sendEscrowCreated(
    email: string,
    orderId: string,
    amount: number,
    currency: string
  ) {
    return sendEmail({
      to: email,
      subject: `Payment Held in Escrow - Order #${orderId}`,
      template: "escrow-created",
      dynamicData: { orderId, amount, currency },
    });
  }

  async sendEscrowReleased(
    email: string,
    orderId: string,
    amount: number,
    currency: string
  ) {
    return sendEmail({
      to: email,
      subject: `Payment Released - Order #${orderId}`,
      template: "escrow-released",
      dynamicData: { orderId, amount, currency },
    });
  }

  async sendEscrowDisputed(
    email: string,
    orderId: string,
    disputedBy: string,
    reason: string,
    adminUrl: string
  ) {
    return sendEmail({
      to: email,
      subject: `Escrow Dispute - Order #${orderId}`,
      template: "escrow-disputed",
      dynamicData: { orderId, disputedBy, reason, adminUrl },
    });
  }

  async sendTrackingAdded(
    email: string,
    orderId: string,
    carrier: string,
    trackingNumber: string,
    trackingUrl: string
  ) {
    return sendEmail({
      to: email,
      subject: `Order #${orderId} Shipped - TradePal`,
      template: "tracking-added",
      dynamicData: { orderId, carrier, trackingNumber, trackingUrl },
    });
  }
}
