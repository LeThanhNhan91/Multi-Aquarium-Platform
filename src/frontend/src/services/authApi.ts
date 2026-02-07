import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth.type";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Endpoint Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Endpoint Register
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    getProfile: builder.query<AuthResponse["user"], void>({
      query: () => "/auth/me",
    }),
  }),
});

// Export hooks auto-generated (dùng trong component)
export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } =
  authApi;
