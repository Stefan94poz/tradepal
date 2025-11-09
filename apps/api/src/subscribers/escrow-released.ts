import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendEmail } from "../services/email";

/**
 * Subscriber for escrow.released event
 * Notifies seller when escrow payment is released
 */
export default async function escrowReleasedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string;
  order_id: string;
  seller_id: string;
  amount: number;
  currency: string;
}>) {
  try {
    const { seller_id, amount, currency, order_id } = data;

    // TODO: Fetch seller email from seller module
    // For now, using a placeholder
    const sellerEmail = "seller@example.com";
    const sellerName = "Seller";

    await sendEmail({
      to: sellerEmail,
      subject: "Escrow Payment Released",
      template: "escrow-released",
      dynamicData: {
        seller_name: sellerName,
        amount: (amount / 100).toFixed(2),
        currency: currency.toUpperCase(),
        order_id,
        release_date: new Date().toLocaleDateString(),
      },
    });

    console.log(
      `[ESCROW SUBSCRIBER] Sent escrow release notification to ${sellerEmail}`
    );
  } catch (error) {
    console.error(
      `[ESCROW SUBSCRIBER] Failed to send escrow release notification:`,
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "escrow.released",
};
