import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_MODULE } from "../../../../modules/search";
import SearchService from "../../../../modules/search/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const {
    q,
    category,
    min_price,
    max_price,
    seller_location,
    min_moq,
    max_moq,
    availability,
    limit = 20,
    offset = 0,
    sort,
  } = req.query;

  const searchService: SearchService = req.scope.resolve(SEARCH_MODULE);

  const results = await searchService.searchProducts({
    query: q as string,
    category: category as string,
    minPrice: min_price ? parseFloat(min_price as string) : undefined,
    maxPrice: max_price ? parseFloat(max_price as string) : undefined,
    sellerLocation: seller_location as string,
    minMoq: min_moq ? parseInt(min_moq as string) : undefined,
    maxMoq: max_moq ? parseInt(max_moq as string) : undefined,
    availabilityStatus: availability as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
    sort: sort ? (sort as string).split(",") : undefined,
  });

  res.json({
    products: results.hits,
    total: results.total,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
    query: q,
    processingTimeMs: results.processingTimeMs,
  });
};
