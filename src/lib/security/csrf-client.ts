/**
 * Client-side CSRF Token utilities
 * Safe for browser environments
 */

/**
 * Client-side utility to get CSRF token from meta tag or API
 */
export const clientCSRFUtils = {
  /**
   * Get CSRF token from meta tag
   */
  getTokenFromMeta(): string | null {
    if (typeof document === "undefined") return null;

    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag?.getAttribute("content") || null;
  },

  /**
   * Fetch CSRF token from API
   */
  async fetchToken(): Promise<string | null> {
    try {
      const response = await fetch("/api/csrf-token");
      if (response.ok) {
        const token = response.headers.get("X-CSRF-Token");
        return token;
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
    return null;
  },

  /**
   * Get CSRF token (try meta tag first, then API)
   */
  async getToken(): Promise<string | null> {
    let token = this.getTokenFromMeta();
    if (!token) {
      token = await this.fetchToken();
    }
    return token;
  },

  /**
   * Add CSRF token to fetch options
   */
  async addTokenToFetchOptions(options: RequestInit = {}): Promise<RequestInit> {
    const token = await this.getToken();
    if (token) {
      options.headers = {
        ...options.headers,
        "X-CSRF-Token": token,
      };
    }
    return options;
  },
};
