import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PARTNER_DIRECTORY_MODULE } from "../../../../modules/partner-directory";
import PartnerDirectoryModuleService from "../../../../modules/partner-directory/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const partnerService: PartnerDirectoryModuleService = req.scope.resolve(
    PARTNER_DIRECTORY_MODULE
  );

  const filters: any = {
    is_published: true,
    is_verified: true, // Only show verified partners
  };

  // Apply search filters from query parameters
  if (req.query.country) {
    filters.country = req.query.country;
  }

  if (req.query.company_name) {
    filters.company_name = {
      $like: `%${req.query.company_name}%`,
    };
  }

  // For array fields (industry, looking_for, offers), we'll need to filter in memory
  // or use a more advanced query. For now, let's get all and filter
  const [allPartners, count] =
    await partnerService.listAndCountPartnerDirectoryProfiles(filters, {
      take: 100, // Get more for filtering
      skip: 0,
    });

  let filteredPartners = allPartners;

  // Filter by industry if provided
  if (req.query.industry) {
    const industries = Array.isArray(req.query.industry)
      ? req.query.industry
      : [req.query.industry];

    filteredPartners = filteredPartners.filter((partner) =>
      partner.industry?.some((ind) => industries.includes(ind))
    );
  }

  // Filter by looking_for if provided
  if (req.query.looking_for) {
    const lookingFor = Array.isArray(req.query.looking_for)
      ? req.query.looking_for
      : [req.query.looking_for];

    filteredPartners = filteredPartners.filter((partner) =>
      partner.looking_for?.some((lf) => lookingFor.includes(lf))
    );
  }

  // Filter by offers if provided
  if (req.query.offers) {
    const offers = Array.isArray(req.query.offers)
      ? req.query.offers
      : [req.query.offers];

    filteredPartners = filteredPartners.filter((partner) =>
      partner.offers?.some((offer) => offers.includes(offer))
    );
  }

  // Apply pagination
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const paginatedPartners = filteredPartners.slice(offset, offset + limit);

  res.json({
    partners: paginatedPartners,
    count: filteredPartners.length,
    limit,
    offset,
  });
};
