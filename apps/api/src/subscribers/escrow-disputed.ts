import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendEmail } from "../services/email";

/**
 * Subscriber for escrow.disputed event
 * Notifies admin when an escrow transaction is disputed
 */
export default async function escrowDisputedHandler({
  event: { data },
}: SubscriberArgs<{
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  dispute_reason: string;
}>) {
  try {
    const { order_id, amount, currency, dispute_reason, buyer_id, seller_id } =
      data;

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@tradepal.com";

    await sendEmail({
      to: adminEmail,
      subject: "Escrow Dispute Requires Review",
      template: "escrow-disputed",
      dynamicData: {
        order_id,
        amount: (amount / 100).toFixed(2),
        currency: currency.toUpperCase(),
        dispute_reason,
        buyer_id,
        seller_id,
        dispute_date: new Date().toLocaleDateString(),
      },
    });

    console.log(
      `[ESCROW SUBSCRIBER] Sent escrow dispute notification to admin`
    );
  } catch (error) {
    console.error(
      `[ESCROW SUBSCRIBER] Failed to send escrow dispute notification:`,
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "escrow.disputed",
};
