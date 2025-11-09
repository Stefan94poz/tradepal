import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { country, industry, lookingFor, offers } = req.query as {
      country?: string;
      industry?: string;
      lookingFor?: string;
      offers?: string;
    };

    const partnerModuleService = req.scope.resolve("partnerModuleService");

    // Build filters
    const filters: any = {
      is_verified: true, // Only show verified partners
    };

    if (country) {
      filters.country = country;
    }

    if (industry) {
      filters.industry = industry;
    }

    // Use the searchPartners method if we have array filters
    if (lookingFor || offers) {
      const searchFilters: any = { ...filters };

      if (lookingFor) {
        searchFilters.lookingFor = lookingFor.split(",");
      }

      if (offers) {
        searchFilters.offers = offers.split(",");
      }

      const partners = await (partnerModuleService as any).searchPartners(
        searchFilters
      );

      res.json({
        partners: partners.map((partner: any) => ({
          id: partner.id,
          userId: partner.user_id,
          profileType: partner.profile_type,
          companyName: partner.company_name,
          country: partner.country,
          industry: partner.industry,
          lookingFor: partner.looking_for,
          offers: partner.offers,
          isVerified: partner.is_verified,
          createdAt: partner.created_at,
        })),
        count: partners.length,
        filters: { country, industry, lookingFor, offers },
      });
    } else {
      // Simple list with basic filters
      const partners = await (partnerModuleService as any).listPartnerProfiles(
        filters
      );

      res.json({
        partners: partners.map((partner: any) => ({
          id: partner.id,
          userId: partner.user_id,
          profileType: partner.profile_type,
          companyName: partner.company_name,
          country: partner.country,
          industry: partner.industry,
          lookingFor: partner.looking_for,
          offers: partner.offers,
          isVerified: partner.is_verified,
          createdAt: partner.created_at,
        })),
        count: partners.length,
        filters: { country, industry },
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to search partners",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
