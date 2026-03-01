import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { RootState } from "./store";
import { logout } from "./features/authSlice";
import { toast } from "sonner";
import { tokenCookies } from "@/utils/cookies";

/**
 * Manual JWT decoder to extract claims without adding a new dependency
 */
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    // Add padding if necessary
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Token decoding failed:", e);
    return null;
  }
};

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    // Read token from cookies instead of Redux state for better security
    const token = tokenCookies.getAccessToken();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);

      // Decode token to find StoreId claim and set X-Store-Id header
      const decodedPayload = decodeToken(token);
      if (decodedPayload) {
        // Try various common casing or find by property name (case-insensitive)
        const storeIdKey = Object.keys(decodedPayload).find(
          (k) => k.toLowerCase() === "storeid",
        );
        const storeId = storeIdKey ? decodedPayload[storeIdKey] : null;

        if (storeId) {
          headers.set(
            "X-Store-Id",
            storeId.ToString ? storeId.ToString() : String(storeId),
          );
        }

        // Debug log to help identify claim names in DevTools
        if (process.env.NODE_ENV === "development") {
          console.log("JWT Payload:", decodedPayload);
          if (storeId) console.log("Resolved StoreId:", storeId);
        }
      }
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401) {
      api.dispatch(logout());
    }
    // Only show toast for actual API errors
    const errorMessage =
      (result.error.data as any)?.message || "Something went wrong";
    toast.error(errorMessage);
  }

  return result;
};
