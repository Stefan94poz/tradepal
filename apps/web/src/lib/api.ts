/**
 * Medusa API Client Configuration
 * Handles communication with Medusa v2 backend REST API
 */

const MEDUSA_API_URL =
  process.env.NEXT_PUBLIC_MEDUSA_API_URL || "http://localhost:9000";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Generic API fetch wrapper with error handling and authentication
 */
async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${MEDUSA_API_URL}${endpoint}`;

  // Get auth token from cookies if available
  const token =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("medusa_auth_token="))
          ?.split("=")[1]
      : undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    return apiFetch("/store/auth", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Register new user
   */
  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    return apiFetch("/store/customers", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  /**
   * Get current authenticated user
   */
  getMe: async () => {
    return apiFetch("/store/customers/me");
  },

  /**
   * Logout user
   */
  logout: async () => {
    return apiFetch("/store/auth", {
      method: "DELETE",
    });
  },
};

/**
 * Product API
 */
export const productApi = {
  /**
   * List products with filters
   */
  list: async (params?: {
    limit?: number;
    offset?: number;
    q?: string;
    category_id?: string;
  }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>)}`
      : "";
    return apiFetch(`/store/products${queryString}`);
  },

  /**
   * Get product by ID
   */
  get: async (id: string) => {
    return apiFetch(`/store/products/${id}`);
  },
};

/**
 * Cart API
 */
export const cartApi = {
  /**
   * Create new cart
   */
  create: async () => {
    return apiFetch("/store/carts", {
      method: "POST",
    });
  },

  /**
   * Get cart by ID
   */
  get: async (id: string) => {
    return apiFetch(`/store/carts/${id}`);
  },

  /**
   * Add item to cart
   */
  addItem: async (cartId: string, variantId: string, quantity: number) => {
    return apiFetch(`/store/carts/${cartId}/line-items`, {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
    });
  },

  /**
   * Update cart item quantity
   */
  updateItem: async (cartId: string, lineId: string, quantity: number) => {
    return apiFetch(`/store/carts/${cartId}/line-items/${lineId}`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    });
  },

  /**
   * Remove item from cart
   */
  removeItem: async (cartId: string, lineId: string) => {
    return apiFetch(`/store/carts/${cartId}/line-items/${lineId}`, {
      method: "DELETE",
    });
  },
};

/**
 * Partner Directory API (Custom)
 */
export const partnerApi = {
  /**
   * Search partners
   */
  search: async (params: {
    query?: string;
    country?: string;
    industry?: string;
    verification_status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    );
    return apiFetch(`/store/partners/search?${queryString}`);
  },

  /**
   * Get partner by ID
   */
  get: async (id: string) => {
    return apiFetch(`/store/partners/${id}`);
  },

  /**
   * Get partner ratings
   */
  getRatings: async (partnerId: string) => {
    return apiFetch(`/store/partners/${partnerId}/ratings`);
  },
};

/**
 * User Profile API (Custom)
 */
export const profileApi = {
  /**
   * Get current user profile
   */
  get: async () => {
    return apiFetch("/store/profile");
  },

  /**
   * Update user profile
   */
  update: async (data: {
    company_name?: string;
    business_type?: string;
    tax_id?: string;
    country?: string;
    city?: string;
    address?: string;
    postal_code?: string;
  }) => {
    return apiFetch("/store/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload verification document
   */
  uploadDocument: async (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", documentType);

    const token =
      typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((row) => row.startsWith("medusa_auth_token="))
            ?.split("=")[1]
        : undefined;

    const response = await fetch(
      `${MEDUSA_API_URL}/store/profile/documents`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload document");
    }

    return response.json();
  },
};

/**
 * Notification API (Custom)
 */
export const notificationApi = {
  /**
   * Get user notifications
   */
  list: async (params?: { limit?: number; offset?: number; unread?: boolean }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>)}`
      : "";
    return apiFetch(`/store/notifications${queryString}`);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string) => {
    return apiFetch(`/store/notifications/${id}/read`, {
      method: "POST",
    });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    return apiFetch("/store/notifications/read-all", {
      method: "POST",
    });
  },

  /**
   * Delete notification
   */
  delete: async (id: string) => {
    return apiFetch(`/store/notifications/${id}`, {
      method: "DELETE",
    });
  },
};

export { MEDUSA_API_URL };
