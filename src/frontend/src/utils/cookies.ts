// Secure cookie utilities for authentication tokens

export const cookies = {
  /**
   * Set a cookie with secure flags
   */
  set: (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    // Use secure flags for production
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict${secure}`;
  },

  /**
   * Get a cookie value by name
   */
  get: (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  /**
   * Delete a cookie by name
   */
  delete: (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },

  /**
   * Check if a cookie exists
   */
  exists: (name: string): boolean => {
    return cookies.get(name) !== null;
  },
};

// Token-specific helpers
export const tokenCookies = {
  setAccessToken: (token: string) => {
    cookies.set("accessToken", token, 1); // 1 day for access token
  },

  setRefreshToken: (token: string) => {
    cookies.set("refreshToken", token, 30); // 30 days for refresh token
  },

  getAccessToken: (): string | null => {
    return cookies.get("accessToken");
  },

  getRefreshToken: (): string | null => {
    return cookies.get("refreshToken");
  },

  clearTokens: () => {
    cookies.delete("accessToken");
    cookies.delete("refreshToken");
  },

  hasTokens: (): boolean => {
    return cookies.exists("accessToken");
  },
};
