import axios, { AxiosInstance } from "axios";

interface Address {
  name: string;
  address_1: string;
  address_2?: string;
  city: string;
  zip: string;
  country_code: string;
  phone?: string;
  email?: string;
}

interface Package {
  weight: number;
  weight_unit: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

interface ShipmentData {
  orderId: string;
  carrier: string;
  fromAddress: Address;
  toAddress: Address;
  packages: Package[];
}

export default class WebshipperService {
  private client: AxiosInstance;
  private enabled: boolean;

  constructor() {
    this.enabled =
      !!process.env.WEBSHIPPER_API_TOKEN &&
      process.env.WEBSHIPPER_API_TOKEN !== "your_api_token_here";

    if (this.enabled) {
      this.client = axios.create({
        baseURL:
          process.env.WEBSHIPPER_BASE_URL || "https://api.webshipper.io/v2",
        headers: {
          Authorization: `Bearer ${process.env.WEBSHIPPER_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      });
    } else {
      console.log("Webshipper integration disabled - no API token configured");
      // Create a dummy client for type safety
      this.client = axios.create();
    }
  }

  /**
   * Create a shipment order in Webshipper
   * @param data - Shipment data
   * @returns Webshipper order response
   */
  async createShipment(data: ShipmentData) {
    if (!this.enabled) {
      console.log("Webshipper disabled - skipping shipment creation");
      return null;
    }

    try {
      const response = await this.client.post("/orders", {
        data: {
          type: "orders",
          attributes: {
            external_id: data.orderId,
            carrier_id: data.carrier,
            delivery_address: {
              att_contact: data.toAddress.name,
              address_1: data.toAddress.address_1,
              address_2: data.toAddress.address_2,
              city: data.toAddress.city,
              zip: data.toAddress.zip,
              country_code: data.toAddress.country_code,
              phone: data.toAddress.phone,
              email: data.toAddress.email,
            },
            sender_address: {
              att_contact: data.fromAddress.name,
              address_1: data.fromAddress.address_1,
              address_2: data.fromAddress.address_2,
              city: data.fromAddress.city,
              zip: data.fromAddress.zip,
              country_code: data.fromAddress.country_code,
              phone: data.fromAddress.phone,
              email: data.fromAddress.email,
            },
            packages: data.packages.map((pkg) => ({
              weight: pkg.weight,
              weight_unit: pkg.weight_unit,
              dimensions: pkg.dimensions
                ? {
                    length: pkg.dimensions.length,
                    width: pkg.dimensions.width,
                    height: pkg.dimensions.height,
                    unit: pkg.dimensions.unit,
                  }
                : undefined,
            })),
          },
        },
      });

      return response.data;
    } catch (error) {
      console.error("Webshipper createShipment error:", error);
      throw error;
    }
  }

  /**
   * Get tracking information for a shipment
   * @param shipmentId - Webshipper order ID
   * @returns Tracking data
   */
  async getTracking(shipmentId: string) {
    if (!this.enabled) {
      return null;
    }

    try {
      const response = await this.client.get(`/orders/${shipmentId}/tracking`);
      return response.data;
    } catch (error) {
      console.error("Webshipper getTracking error:", error);
      throw error;
    }
  }

  /**
   * Get shipment status
   * @param shipmentId - Webshipper order ID
   * @returns Order status data
   */
  async getShipmentStatus(shipmentId: string) {
    if (!this.enabled) {
      return null;
    }

    try {
      const response = await this.client.get(`/orders/${shipmentId}`);
      return response.data;
    } catch (error) {
      console.error("Webshipper getShipmentStatus error:", error);
      throw error;
    }
  }

  /**
   * List available carriers
   * @returns List of carrier options
   */
  async listCarriers() {
    if (!this.enabled) {
      return [];
    }

    try {
      const response = await this.client.get("/carriers");
      return response.data;
    } catch (error) {
      console.error("Webshipper listCarriers error:", error);
      throw error;
    }
  }

  /**
   * Get carrier rates for a shipment
   * @param data - Shipment data for rate calculation
   * @returns Available shipping rates
   */
  async getShippingRates(data: Omit<ShipmentData, "carrier">) {
    if (!this.enabled) {
      return [];
    }

    try {
      const response = await this.client.post("/shipping_rates", {
        data: {
          type: "shipping_rates",
          attributes: {
            delivery_address: data.toAddress,
            sender_address: data.fromAddress,
            packages: data.packages,
          },
        },
      });

      return response.data;
    } catch (error) {
      console.error("Webshipper getShippingRates error:", error);
      throw error;
    }
  }

  /**
   * Cancel a shipment
   * @param shipmentId - Webshipper order ID
   */
  async cancelShipment(shipmentId: string) {
    if (!this.enabled) {
      return null;
    }

    try {
      const response = await this.client.delete(`/orders/${shipmentId}`);
      return response.data;
    } catch (error) {
      console.error("Webshipper cancelShipment error:", error);
      throw error;
    }
  }
}
