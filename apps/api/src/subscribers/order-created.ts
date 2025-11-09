import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { sendEmail } from "../services/email";

/**
 * Subscriber for order.created event
 * Notifies seller when a new order is placed for their products
 */
export default async function orderCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id;

  try {
    // Retrieve order details
    const orderModuleService = container.resolve(Modules.ORDER);
    const order: any = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items", "shipping_address"],
    });

    // Extract seller information from order metadata or items
    const sellerEmail = order.metadata?.seller_email;
    const sellerName = order.metadata?.seller_name || "Seller";

    if (sellerEmail) {
      // Send email notification to seller
      await sendEmail({
        to: sellerEmail,
        subject: "New Order Received",
        template: "order-created-seller",
        dynamicData: {
          seller_name: sellerName,
          order_number: order.display_id || orderId,
          order_total: (order.total / 100).toFixed(2),
          currency: order.currency_code.toUpperCase(),
          buyer_name:
            order.shipping_address?.first_name +
            " " +
            order.shipping_address?.last_name,
          items_count: order.items?.length || 0,
          order_date: new Date(order.created_at).toLocaleDateString(),
        },
      });

      console.log(
        `[ORDER SUBSCRIBER] Sent order notification to ${sellerEmail}`
      );
    } else {
      console.warn(
        `[ORDER SUBSCRIBER] No seller email found for order ${orderId}`
      );
    }
  } catch (error) {
    console.error(
      `[ORDER SUBSCRIBER] Failed to send order notification:`,
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.created",
};
