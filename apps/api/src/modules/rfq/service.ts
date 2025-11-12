import { MedusaService } from "@medusajs/framework/utils";
import RFQ from "./models/rfq";
import RFQQuotation from "./models/rfq-quotation";

class RFQModuleService extends MedusaService({
  RFQ,
  RFQQuotation,
}) {
  // Create RFQ
  async createRFQ(data: {
    buyer_id: string;
    buyer_company: string;
    buyer_email: string;
    buyer_phone?: string;
    title: string;
    description: string;
    product_details: any;
    quantity: number;
    target_price?: number;
    total_budget?: number;
    delivery_deadline?: Date;
    valid_until?: Date;
    special_requirements?: string;
    payment_terms?: string;
  }) {
    return this.createRFQs({
      ...data,
      status: "draft",
      quotations_count: 0,
    });
  }

  // Publish RFQ (make it visible to vendors)
  async publishRFQ(rfq_id: string) {
    return this.updateRFQs({
      id: rfq_id,
      status: "published",
    });
  }

  // Get RFQs by buyer
  async getBuyerRFQs(buyer_id: string, filters: any = {}) {
    return this.listRFQs(
      {
        buyer_id,
        ...filters,
      },
      {
        order: { created_at: "DESC" },
      }
    );
  }

  // Get published RFQs (for vendors to browse)
  async getPublishedRFQs(filters: any = {}) {
    return this.listRFQs(
      {
        status: "published",
        ...filters,
      },
      {
        order: { created_at: "DESC" },
      }
    );
  }

  // Submit quotation
  async submitQuotation(data: {
    rfq_id: string;
    vendor_id: string;
    quoted_price: number;
    total_price: number;
    lead_time_days: number;
    minimum_order_quantity?: number;
    validity_days?: number;
    payment_terms?: string;
    delivery_terms?: string;
    notes?: string;
  }) {
    // Create quotation
    const quotation = await this.createRFQQuotations({
      ...data,
      status: "submitted",
      submitted_at: new Date(),
    });

    // Update RFQ quotations count and status
    const rfq = await this.retrieveRFQ(data.rfq_id);
    await this.updateRFQs({
      id: data.rfq_id,
      quotations_count: rfq.quotations_count + 1,
      status: "quoted",
    });

    return quotation;
  }

  // Get quotations for an RFQ
  async getRFQQuotations(rfq_id: string) {
    return this.listRFQQuotations(
      {
        rfq_id,
      },
      {
        order: { submitted_at: "DESC" },
      }
    );
  }

  // Get vendor's quotations
  async getVendorQuotations(vendor_id: string, filters: any = {}) {
    return this.listRFQQuotations(
      {
        vendor_id,
        ...filters,
      },
      {
        order: { submitted_at: "DESC" },
      }
    );
  }

  // Accept quotation (buyer selects a vendor)
  async acceptQuotation(quotation_id: string) {
    const quotation = await this.retrieveRFQQuotation(quotation_id);

    // Update quotation status
    await this.updateRFQQuotations({
      id: quotation_id,
      status: "accepted",
      responded_at: new Date(),
    });

    // Update RFQ status
    await this.updateRFQs({
      id: quotation.rfq_id,
      status: "accepted",
    });

    // Reject other quotations for this RFQ
    const otherQuotations = await this.listRFQQuotations({
      rfq_id: quotation.rfq_id,
      status: "submitted",
    });

    for (const other of otherQuotations) {
      if (other.id !== quotation_id) {
        await this.updateRFQQuotations({
          id: other.id,
          status: "rejected",
          responded_at: new Date(),
        });
      }
    }

    return quotation;
  }

  // Reject quotation
  async rejectQuotation(quotation_id: string, reason?: string) {
    return this.updateRFQQuotations({
      id: quotation_id,
      status: "rejected",
      responded_at: new Date(),
      notes: reason,
    });
  }

  // Close RFQ without accepting any quotation
  async closeRFQ(rfq_id: string) {
    return this.updateRFQs({
      id: rfq_id,
      status: "closed",
    });
  }
}

export default RFQModuleService;
