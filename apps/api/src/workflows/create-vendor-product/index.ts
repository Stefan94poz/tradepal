import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createProductsStep,
  updateProductsStep,
} from "@medusajs/medusa/core-flows";
import { validateVendorOwnershipStep } from "./steps/validate-vendor-ownership";
import { linkProductToVendorStep } from "./steps/link-product-to-vendor";

export type CreateVendorProductInput = {
  vendor_id: string;
  product: {
    title: string;
    description?: string;
    handle?: string;
    is_giftcard?: boolean;
    discountable?: boolean;
    options?: Array<{
      title: string;
      values: string[];
    }>;
    variants?: Array<{
      title: string;
      sku?: string;
      ean?: string;
      upc?: string;
      barcode?: string;
      prices: Array<{
        amount: number;
        currency_code: string;
      }>;
      options?: Record<string, string>;
      inventory_quantity?: number;
      manage_inventory?: boolean;
      allow_backorder?: boolean;
    }>;
    images?: Array<{
      url: string;
    }>;
    thumbnail?: string;
    metadata?: Record<string, any>;
  };
};

export const createVendorProductWorkflow = createWorkflow(
  "create-vendor-product",
  (input: CreateVendorProductInput) => {
    // Step 1: Validate vendor exists and is active
    validateVendorOwnershipStep({
      vendor_id: input.vendor_id,
    });

    // Step 2: Create product using Medusa's core workflow
    const product = createProductsStep([
      {
        ...input.product,
        status: "draft", // Vendors create products in draft by default
      },
    ]);

    // Step 3: Link product to vendor
    linkProductToVendorStep({
      vendor_id: input.vendor_id,
      product_id: product[0].id,
    });

    return new WorkflowResponse({
      product: product[0],
    });
  }
);

export type UpdateVendorProductInput = {
  vendor_id: string;
  product_id: string;
  update: {
    title?: string;
    description?: string;
    handle?: string;
    status?: "draft" | "proposed" | "published" | "rejected";
    thumbnail?: string;
    metadata?: Record<string, any>;
  };
};

export const updateVendorProductWorkflow = createWorkflow(
  "update-vendor-product",
  (input: UpdateVendorProductInput) => {
    // Step 1: Validate vendor owns this product
    validateVendorOwnershipStep({
      vendor_id: input.vendor_id,
      product_id: input.product_id,
    });

    // Step 2: Update product
    const product = updateProductsStep({
      selector: { id: input.product_id },
      update: input.update,
    });

    return new WorkflowResponse({
      product,
    });
  }
);
