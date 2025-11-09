import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../../modules/search";
import SearchService from "../../../../modules/search/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const {
    q,
    country,
    industry,
    looking_for,
    offers,
    limit = 20,
    offset = 0,
  } = req.query;

  const searchService: SearchService = req.scope.resolve(SEARCH_MODULE);

  // Parse array parameters
  const industryArray = industry
    ? ((Array.isArray(industry) ? industry : [industry]) as string[])
    : undefined;
  const lookingForArray = looking_for
    ? ((Array.isArray(looking_for) ? looking_for : [looking_for]) as string[])
    : undefined;
  const offersArray = offers
    ? ((Array.isArray(offers) ? offers : [offers]) as string[])
    : undefined;

  const results = await searchService.searchPartners({
    query: q as string,
    country: country as string,
    industry: industryArray,
    lookingFor: lookingForArray,
    offers: offersArray,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });

  res.json({
    partners: results.hits,
    total: results.total,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
    query: q,
    processingTimeMs: results.processingTimeMs,
  });
};
