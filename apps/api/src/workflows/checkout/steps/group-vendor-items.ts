import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export type GroupCartItemsByVendorInput = {
  cart_id: string;
};

export type VendorItemGroup = {
  vendor_id: string;
  vendor_name: string;
  items: Array<{
    item_id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
};

/**
 * Group Cart Items by Vendor Step
 *
 * Uses remoteQuery to retrieve cart items with their associated vendor information
 * via the product-vendor module link, then groups items by vendor_id.
 */
export const groupCartItemsByVendorStep = createStep(
  "group-cart-items-by-vendor",
  async (input: GroupCartItemsByVendorInput, { container }) => {
    const remoteQuery = container.resolve("remoteQuery");

    // Query cart with items and their product-vendor relationships
    const cartData = await remoteQuery({
      entryPoint: "cart",
      fields: [
        "id",
        "items.*",
        "items.product_id",
        "items.variant_id",
        "items.quantity",
        "items.unit_price",
        "items.total",
      ],
      variables: {
        filters: {
          id: input.cart_id,
        },
      },
    });

    if (!cartData || cartData.length === 0) {
      throw new Error(`Cart ${input.cart_id} not found`);
    }

    const cart = cartData[0];

    // For each cart item, get the vendor via product-vendor link
    const vendorGroups = new Map<string, VendorItemGroup>();

    for (const item of cart.items) {
      // Query product-vendor link to get vendor for this product
      const productVendorLinks = await remoteQuery({
        entryPoint: "product_vendor",
        fields: [
          "product_id",
          "vendor_id",
          "vendor.id",
          "vendor.name",
          "vendor.is_active",
        ],
        variables: {
          filters: {
            product_id: item.product_id,
          },
        },
      });

      if (!productVendorLinks || productVendorLinks.length === 0) {
        throw new Error(
          `Product ${item.product_id} is not linked to any vendor`
        );
      }

      const link = productVendorLinks[0];
      const vendor = link.vendor;

      if (!vendor.is_active) {
        throw new Error(
          `Vendor ${vendor.name} is not active. Cannot process order.`
        );
      }

      // Add item to vendor group
      const vendorId = vendor.id;
      const existing = vendorGroups.get(vendorId) || {
        vendor_id: vendorId,
        vendor_name: vendor.name,
        items: [],
        subtotal: 0,
      };

      existing.items.push({
        item_id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      });

      existing.subtotal += item.total;

      vendorGroups.set(vendorId, existing);
    }

    const groupedItems = Array.from(vendorGroups.values());

    return new StepResponse({
      cart_id: input.cart_id,
      vendor_groups: groupedItems,
      total_vendors: groupedItems.length,
    });
  }
);
