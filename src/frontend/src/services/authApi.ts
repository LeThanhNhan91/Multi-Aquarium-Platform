import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth.type";
import { ApiResponse } from "@/types/baseModel";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Login Endpoint
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Register Endpoint
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

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } =
  authApi;
