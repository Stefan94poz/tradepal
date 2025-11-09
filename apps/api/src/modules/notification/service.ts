import { MedusaService } from "@medusajs/framework/utils";
import Notification from "./models/notification";

type NotificationData = {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  send_email?: boolean;
};

class NotificationModuleService extends MedusaService({
  Notification,
}) {
  async createNotification(data: NotificationData): Promise<typeof Notification> {
    const notification = await this.createNotifications(data);

    // Send email if requested
    if (data.send_email) {
      await this.sendEmail(notification);
    }

    return notification;
  }

  async getUnreadNotifications(userId: string): Promise<typeof Notification[]> {
    return await this.listNotifications({
      user_id: userId,
      read: false,
    }, {
      order: { created_at: "DESC" },
      take: 50,
    });
  }

  async markAsRead(notificationId: string): Promise<typeof Notification> {
    return await this.updateNotifications(notificationId, {
      read: true,
      read_at: new Date(),
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.listNotifications({
      user_id: userId,
      read: false,
    });

    for (const notification of notifications) {
      await this.markAsRead(notification.id);
    }
  }

  async sendEmail(notification: typeof Notification): Promise<void> {
    // Get email template based on notification type
    const template = this.getEmailTemplate(notification.type);
    
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // For now, just log the email that would be sent
    console.log(`[EMAIL] To: ${notification.user_id}`);
    console.log(`[EMAIL] Subject: ${template.subject}`);
    console.log(`[EMAIL] Body: ${template.body(notification)}`);

    // Mark email as sent
    await this.updateNotifications(notification.id, {
      email_sent: true,
    });
  }

  private getEmailTemplate(type: string): {
    subject: string;
    body: (notification: typeof Notification) => string;
  } {
    const templates: Record<string, { subject: string; body: (n: typeof Notification) => string }> = {
      verification_approved: {
        subject: "✅ Your profile has been verified",
        body: (n) => `
Hello,

Great news! Your profile has been successfully verified.

You can now access all features of the TradePal platform.

Best regards,
TradePal Team
        `.trim(),
      },
      verification_rejected: {
        subject: "❌ Profile verification requires attention",
        body: (n) => `
Hello,

We were unable to verify your profile at this time.

Reason: ${n.data?.reason || "Documents did not meet our requirements"}

Please review your information and resubmit your verification documents.

Best regards,
TradePal Team
        `.trim(),
      },
      order_created: {
        subject: "🛒 New order received",
        body: (n) => `
Hello,

You have received a new order #${n.data?.order_id}.

Please review and accept or decline the order in your dashboard.

Best regards,
TradePal Team
        `.trim(),
      },
      order_accepted: {
        subject: "✅ Order accepted",
        body: (n) => `
Hello,

Your order #${n.data?.order_id} has been accepted by the seller.

Payment has been securely held in escrow and will be released upon delivery confirmation.

Best regards,
TradePal Team
        `.trim(),
      },
      order_declined: {
        subject: "❌ Order declined",
        body: (n) => `
Hello,

Unfortunately, your order #${n.data?.order_id} has been declined by the seller.

Reason: ${n.data?.reason || "Not specified"}

You have not been charged for this order.

Best regards,
TradePal Team
        `.trim(),
      },
      escrow_created: {
        subject: "🔒 Payment held in escrow",
        body: (n) => `
Hello,

Payment for order #${n.data?.order_id} has been securely held in escrow.

The funds will be released to the seller once you confirm delivery.

Best regards,
TradePal Team
        `.trim(),
      },
      escrow_released: {
        subject: "💰 Payment released",
        body: (n) => `
Hello,

Payment for order #${n.data?.order_id} has been released from escrow.

Thank you for your business!

Best regards,
TradePal Team
        `.trim(),
      },
      escrow_disputed: {
        subject: "⚠️ Escrow dispute opened",
        body: (n) => `
Hello,

A dispute has been opened for order #${n.data?.order_id}.

Our support team will review the case and contact you shortly.

Best regards,
TradePal Team
        `.trim(),
      },
      shipment_created: {
        subject: "📦 Your order has shipped",
        body: (n) => `
Hello,

Your order #${n.data?.order_id} has been shipped!

Tracking Number: ${n.data?.tracking_number}
Carrier: ${n.data?.carrier}

You can track your shipment in your dashboard.

Best regards,
TradePal Team
        `.trim(),
      },
      shipment_delivered: {
        subject: "✅ Order delivered",
        body: (n) => `
Hello,

Your order #${n.data?.order_id} has been delivered!

Please confirm delivery in your dashboard to release payment to the seller.

Best regards,
TradePal Team
        `.trim(),
      },
    };

    return templates[type] || {
      subject: "Notification from TradePal",
      body: (n) => n.message,
    };
  }
}

export default NotificationModuleService;
