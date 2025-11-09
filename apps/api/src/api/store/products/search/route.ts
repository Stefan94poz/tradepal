import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { B2B_PRODUCT_MODULE } from "../../../../modules/b2b-product";
import B2BProductConfigService from "../../../../modules/b2b-product/service";

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
  } = req.query;

  // TODO: Implement full product search with filters
  // This requires integration with Medusa product service
  // For now, just search B2B configs

  const b2bProductService: B2BProductConfigService =
    req.scope.resolve(B2B_PRODUCT_MODULE);

  const filters: any = {};

  if (min_moq) {
    filters.minimum_order_quantity = { $gte: Number(min_moq) };
  }
  if (max_moq) {
    filters.minimum_order_quantity = {
      ...filters.minimum_order_quantity,
      $lte: Number(max_moq),
    };
  }
  if (availability) {
    filters.availability_status = availability;
  }

  const [configs, count] =
    await b2bProductService.listAndCountB2BProductConfigs(filters, {
      skip: Number(offset),
      take: Number(limit),
    });

  res.json({
    products: [],
    b2b_configs: configs,
    count,
    limit: Number(limit),
    offset: Number(offset),
    message: "TODO: Integrate with Medusa product service for full search",
  });
};
