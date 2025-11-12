import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";

type StepInput = {
  query: string;
  filters?: Record<string, any>;
  results_count: number;
  user_id?: string;
};

const trackProductSearchStep = createStep(
  "track-product-search-step",
  async (
    { query, filters, results_count, user_id }: StepInput,
    { container }
  ) => {
    const analyticsModuleService = container.resolve(Modules.ANALYTICS);

    await analyticsModuleService.track({
      event: "product_search",
      actor_id: user_id || "anonymous",
      properties: {
        search_query: query,
        filters,
        results_count,
        timestamp: new Date().toISOString(),
      },
    });
  }
);

type WorkflowInput = {
  query: string;
  filters?: Record<string, any>;
  results_count: number;
  user_id?: string;
};

export const trackProductSearchWorkflow = createWorkflow(
  "track-product-search-workflow",
  (input: WorkflowInput) => {
    trackProductSearchStep(input);
  }
);
