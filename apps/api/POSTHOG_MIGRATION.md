# PostHog Analytics Integration - Medusa v2 Approach

## Summary

Successfully migrated PostHog analytics integration from a custom service implementation to **Medusa's native Analytics Module**, following official Medusa v2 best practices.

## What Changed

### ❌ Removed (Old Approach)

1. **Custom Service**: `src/services/analytics.ts` - Direct `posthog-node` integration
2. **Environment Variable**: `POSTHOG_API_KEY` → Changed to `POSTHOG_EVENTS_API_KEY`
3. **Direct Service Calls**: Subscribers directly instantiated `AnalyticsService`

### ✅ Added (New Approach)

1. **Medusa Analytics Module Configuration** (`medusa-config.ts`):

```typescript
{
  resolve: "@medusajs/medusa/analytics",
  options: {
    providers: [
      {
        resolve: "@medusajs/analytics-posthog",
        id: "posthog",
        options: {
          posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
          posthogHost: process.env.POSTHOG_HOST || "https://app.posthog.com",
        },
      },
    ],
  },
}
```

2. **Analytics Workflows**:
   - `src/workflows/track-order-placed.ts` - Uses `Modules.ANALYTICS` service
   - `src/workflows/track-product-search.ts` - Uses `Modules.ANALYTICS` service

3. **Updated Subscribers**:
   - `src/subscribers/analytics-order-placed.ts` - Executes workflow
   - `src/subscribers/analytics-product-search.ts` - Executes workflow

## Benefits of Medusa Analytics Module

1. **Official Support**: Built-in Medusa module with guaranteed compatibility
2. **Consistent API**: Uses same patterns as other Medusa modules
3. **Better Abstraction**: Analytics logic encapsulated in workflows
4. **Transaction Safety**: Workflows provide rollback mechanisms
5. **Future-Proof**: Will receive updates with Medusa framework

## Environment Variables

**Before**:

```bash
POSTHOG_API_KEY=phc_your_project_api_key_here
POSTHOG_HOST=https://app.posthog.com
```

**After**:

```bash
POSTHOG_EVENTS_API_KEY=phc_your_project_api_key_here
POSTHOG_HOST=https://app.posthog.com
```

## How to Use

### Track Events in Workflows

```typescript
import { Modules } from "@medusajs/framework/utils";

const analyticsModuleService = container.resolve(Modules.ANALYTICS);

await analyticsModuleService.track({
  event: "order_placed",
  actor_id: order.customer_id,
  properties: {
    order_id: order.id,
    total: order.total,
    // ... additional properties
  },
});
```

### Identify Users

```typescript
await analyticsModuleService.identify({
  actor_id: "customer_123",
  properties: {
    name: "John Doe",
    email: "john@example.com",
    // ... additional traits
  },
});
```

## Dependencies

- `posthog-node` v5.11.2 - Peer dependency for `@medusajs/analytics-posthog`
- `@medusajs/analytics-posthog` - Built-in Medusa Analytics Module provider

## Testing

1. Ensure environment variables are set in `.env`
2. Place an order to trigger `order.placed` event
3. Check PostHog dashboard for tracked event
4. Search for products to trigger `product.searched` event

## References

- [Medusa Analytics Module Documentation](https://docs.medusajs.com/resources/infrastructure-modules/analytics)
- [PostHog Analytics Provider](https://docs.medusajs.com/resources/infrastructure-modules/analytics/posthog)
- [Analytics Module Service Reference](https://docs.medusajs.com/resources/references/analytics/service)

## Docker Notes

**Important**: The `posthog-node` package must be installed in the Docker container's `node_modules`. The current setup uses:

- Volume mount: `.:/server` (mounts host code to container)
- Volume exclusion: `/server/node_modules` (uses container's built node_modules)
- This ensures the container uses dependencies built during Docker image creation

## Migration Complete ✅

- [x] Removed custom analytics service
- [x] Configured Medusa Analytics Module
- [x] Created analytics workflows
- [x] Updated subscribers to use workflows
- [x] Updated environment variables
- [x] Rebuilt Docker image
- [x] Verified Medusa starts successfully
- [x] Updated documentation
