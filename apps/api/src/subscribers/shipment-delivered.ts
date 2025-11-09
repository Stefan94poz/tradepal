import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendEmail } from "../services/email";

/**
 * Subscriber for shipment.delivered event
 * Notifies buyer when shipment is delivered
 */
export default async function shipmentDeliveredHandler({
  event: { data },
}: SubscriberArgs<{
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
}>) {
  try {
    const { order_id, tracking_number, carrier } = data;

    // TODO: Fetch buyer email from order
    const buyerEmail = "buyer@example.com";
    const buyerName = "Buyer";

    await sendEmail({
      to: buyerEmail,
      subject: "Your Order Has Been Delivered",
      template: "tracking-added",
      dynamicData: {
        buyer_name: buyerName,
        order_id,
        tracking_number,
        carrier,
        delivery_date: new Date().toLocaleDateString(),
        confirm_delivery_link: `${process.env.STORE_URL}/orders/${order_id}/confirm-delivery`,
      },
    });

    console.log(
      `[SHIPMENT SUBSCRIBER] Sent delivery notification to ${buyerEmail}`
    );
  } catch (error) {
    console.error(
      `[SHIPMENT SUBSCRIBER] Failed to send delivery notification:`,
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "shipment.delivered",
};
