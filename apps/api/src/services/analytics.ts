import { PostHog } from "posthog-node";

export default class AnalyticsService {
  private client: PostHog | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = !!process.env.POSTHOG_API_KEY && process.env.POSTHOG_API_KEY !== "phc_your_project_api_key_here";

    if (this.enabled) {
      this.client = new PostHog(process.env.POSTHOG_API_KEY!, {
        host: process.env.POSTHOG_HOST || "https://app.posthog.com",
        flushAt: 10, // Flush events after 10 events
        flushInterval: 10000, // Flush events every 10 seconds
      });
    } else {
      console.log(
        "PostHog analytics disabled - no API key configured"
      );
    }
  }

  /**
   * Track an event
   * @param userId - User identifier
   * @param event - Event name
   * @param properties - Additional event properties
   */
  async trackEvent(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ) {
    if (!this.enabled || !this.client) {
      return;
    }

    this.client.capture({
      distinctId: userId,
      event,
      properties,
    });
  }

  /**
   * Identify a user with traits
   * @param userId - User identifier
   * @param traits - User traits/properties
   */
  async identifyUser(userId: string, traits: Record<string, any>) {
    if (!this.enabled || !this.client) {
      return;
    }

    this.client.identify({
      distinctId: userId,
      properties: traits,
    });
  }

  /**
   * Check if a feature flag is enabled for a user
   * @param userId - User identifier
   * @param feature - Feature flag key
   * @returns true if enabled, false otherwise
   */
  async isFeatureEnabled(userId: string, feature: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    const result = await this.client.isFeatureEnabled(feature, userId);
    return result ?? false;
  }

  /**
   * Get feature flag payload
   * @param userId - User identifier
   * @param feature - Feature flag key
   * @returns Feature flag payload
   */
  async getFeatureFlagPayload(
    userId: string,
    feature: string
  ): Promise<any> {
    if (!this.enabled || !this.client) {
      return undefined;
    }

    const result = await this.client.getFeatureFlagPayload(feature, userId);
    return result ?? undefined;
  }

  /**
   * Track a page view
   * @param userId - User identifier
   * @param page - Page URL or name
   * @param properties - Additional properties
   */
  async trackPageView(
    userId: string,
    page: string,
    properties?: Record<string, any>
  ) {
    await this.trackEvent(userId, "$pageview", {
      $current_url: page,
      ...properties,
    });
  }

  /**
   * Create an alias for a user (link anonymous ID to identified user)
   * @param alias - New user identifier
   * @param distinctId - Previous user identifier
   */
  async alias(alias: string, distinctId: string) {
    if (!this.enabled || !this.client) {
      return;
    }

    this.client.alias({
      distinctId: alias,
      alias: distinctId,
    });
  }

  /**
   * Flush all pending events and shut down the client
   */
  async shutdown() {
    if (this.client) {
      await this.client.shutdown();
    }
  }

  /**
   * Flush pending events immediately
   */
  async flush() {
    if (this.client) {
      await this.client.flush();
    }
  }
}
