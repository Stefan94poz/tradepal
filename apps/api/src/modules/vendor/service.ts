import { MedusaService } from "@medusajs/framework/utils";
import Vendor from "./models/vendor";
import VendorAdmin from "./models/vendor-admin";

class VendorModuleService extends MedusaService({
  Vendor,
  VendorAdmin,
}) {
  // Custom methods beyond auto-generated CRUD

  /**
   * Create a new vendor with admin user
   */
  async createVendor(data: {
    handle: string;
    name: string;
    email: string;
    country: string;
    business_type: string;
    admin_email: string;
    admin_first_name?: string;
    admin_last_name?: string;
  }) {
    // Create vendor
    const vendor = await this.createVendors({
      handle: data.handle,
      name: data.name,
      email: data.email,
      country: data.country,
      business_type: data.business_type,
      verification_status: "pending",
      is_active: true,
      commission_rate: 5, // Default 5%
    });

    // Create vendor admin
    const vendorAdmin = await this.createVendorAdmins({
      email: data.admin_email,
      first_name: data.admin_first_name,
      last_name: data.admin_last_name,
      vendor_id: vendor.id,
    });

    return { vendor, vendorAdmin };
  }

  /**
   * Get vendor by unique handle
   */
  async getVendorByHandle(handle: string) {
    const vendors = await this.listVendors({
      filters: { handle },
    });

    if (!vendors.length) {
      throw new Error(`Vendor with handle "${handle}" not found`);
    }

    return vendors[0];
  }

  /**
   * Update vendor commission rate
   */
  async updateCommissionRate(vendorId: string, commissionRate: number) {
    if (commissionRate < 0 || commissionRate > 100) {
      throw new Error("Commission rate must be between 0 and 100");
    }

    return await this.updateVendors({
      id: vendorId,
      commission_rate: commissionRate,
    });
  }

  /**
   * Approve vendor verification
   */
  async approveVerification(
    vendorId: string,
    level: "basic" | "verified" | "premium" = "verified"
  ) {
    return await this.updateVendors({
      id: vendorId,
      verification_status: level,
    });
  }

  /**
   * Reject vendor verification
   */
  async rejectVerification(vendorId: string) {
    return await this.updateVendors({
      id: vendorId,
      verification_status: "pending",
    });
  }

  /**
   * Update Stripe Connect status
   */
  async updateConnectStatus(
    vendorId: string,
    data: {
      connect_account_id?: string;
      connect_onboarding_complete?: boolean;
      connect_charges_enabled?: boolean;
      connect_payouts_enabled?: boolean;
    }
  ) {
    return await this.updateVendors({
      id: vendorId,
      ...data,
    });
  }

  /**
   * Get active vendors
   */
  async getActiveVendors(filters?: any) {
    return await this.listVendors({
      filters: {
        ...filters,
        is_active: true,
      },
    });
  }

  /**
   * Get verified vendors
   */
  async getVerifiedVendors(filters?: any) {
    return await this.listVendors({
      filters: {
        ...filters,
        verification_status: ["verified", "premium"],
        is_active: true,
      },
    });
  }
}

export default VendorModuleService;
