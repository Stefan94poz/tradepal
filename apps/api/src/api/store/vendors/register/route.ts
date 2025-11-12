import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createVendorRegistrationWorkflow } from "../../../../workflows/create-vendor-registration";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { vendor, admin } = req.body as {
    vendor: any;
    admin: any;
  };

  // Validate required fields
  if (!vendor || !admin) {
    return res.status(400).json({
      error: "Both vendor and admin information are required",
    });
  }

  // Validate vendor fields
  const requiredVendorFields = [
    "handle",
    "name",
    "email",
    "phone",
    "country",
    "city",
    "address",
    "business_type",
  ];
  for (const field of requiredVendorFields) {
    if (!vendor[field]) {
      return res.status(400).json({
        error: `Vendor field '${field}' is required`,
      });
    }
  }

  // Validate admin fields
  const requiredAdminFields = ["email", "first_name", "last_name", "password"];
  for (const field of requiredAdminFields) {
    if (!admin[field]) {
      return res.status(400).json({
        error: `Admin field '${field}' is required`,
      });
    }
  }

  // Validate handle format (alphanumeric and hyphens only)
  if (!/^[a-z0-9-]+$/.test(vendor.handle)) {
    return res.status(400).json({
      error:
        "Vendor handle must contain only lowercase letters, numbers, and hyphens",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(vendor.email)) {
    return res.status(400).json({
      error: "Invalid vendor email format",
    });
  }
  if (!emailRegex.test(admin.email)) {
    return res.status(400).json({
      error: "Invalid admin email format",
    });
  }

  // Validate password strength
  if (admin.password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters long",
    });
  }

  try {
    const { result } = await createVendorRegistrationWorkflow(req.scope).run({
      input: {
        vendor,
        admin,
      },
    });

    return res.status(201).json({
      vendor: result.vendor,
      message:
        "Vendor registration submitted successfully. Your account is pending approval.",
    });
  } catch (error) {
    console.error("Vendor registration error:", error);

    // Handle duplicate handle/email errors
    if (error.message?.includes("duplicate") || error.code === "23505") {
      return res.status(409).json({
        error:
          "A vendor with this handle or email already exists. Please use a different one.",
      });
    }

    return res.status(500).json({
      error: "Failed to register vendor. Please try again later.",
    });
  }
}
