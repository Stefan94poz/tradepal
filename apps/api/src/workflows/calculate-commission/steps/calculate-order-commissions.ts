import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { VENDOR_MODULE } from "../../../modules/vendor";

export type CalculateOrderCommissionsInput = {
  order_id: string;
};

export const calculateOrderCommissionsStep = createStep(
  "calculate-order-commissions",
  async (input: CalculateOrderCommissionsInput, { container }) => {
    const orderModuleService = container.resolve(Modules.ORDER);
    const remoteQuery = container.resolve("remoteQuery");
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    // Get order with line items
    const order = await orderModuleService.retrieveOrder(input.order_id, {
      relations: ["items"],
    });

    if (!order) {
      throw new Error(`Order ${input.order_id} not found`);
    }

    // Group line items by vendor
    const vendorItems = new Map<string, any[]>();

    if (order.items) {
      for (const item of order.items) {
        // Get product's vendor
        const productVendorLinks = await remoteQuery({
          entryPoint: "product_vendor",
          fields: ["product_id", "vendor_id"],
          variables: {
            filters: {
              product_id: item.product_id,
            },
          },
        });

        if (productVendorLinks.length > 0) {
          const vendor_id = productVendorLinks[0].vendor_id;

          if (!vendorItems.has(vendor_id)) {
            vendorItems.set(vendor_id, []);
          }

          vendorItems.get(vendor_id)!.push(item);
        }
      }
    }

    // Calculate commission for each vendor
    const commissionsToCreate: any[] = [];

    for (const [vendor_id, items] of vendorItems) {
      // Get vendor commission rate
      const vendor = await vendorModuleService.retrieveVendor(vendor_id);

      if (!vendor) {
        console.warn(
          `Vendor ${vendor_id} not found, skipping commission calculation`
        );
        continue;
      }

      // Calculate total for this vendor's items
      const vendor_total = items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      );

      commissionsToCreate.push({
        vendor_id,
        order_id: input.order_id,
        order_total: vendor_total,
        commission_rate: vendor.commission_rate,
        currency_code: order.currency_code,
      });
    }

    return new StepResponse(commissionsToCreate);
  }
);
