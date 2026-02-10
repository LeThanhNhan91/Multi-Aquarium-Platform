import { buildCrudEndpoints } from "@/libs/redux/baseCrudApi";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import {
  UpdateImageResponse,
  UpdateProfileRequest,
  UserProfile,
} from "@/types/user.type";
import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/types/baseModel";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    ...buildCrudEndpoints<UserProfile>(builder, {
      resourcePath: "user",
      tagType: "User",
    }),

    getProfile: builder.query<ApiResponse<UserProfile>, void>({
      query: () => "/user/me",
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<
      ApiResponse<UserProfile>,
      UpdateProfileRequest
    >({
      query: (data) => ({
        url: "/user/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    updateAvatar: builder.mutation<UpdateImageResponse, FormData>({
      query: (data) => ({
        url: "/user/me/avatar",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    updateCover: builder.mutation<UpdateImageResponse, FormData>({
      query: (data) => ({
        url: "/user/me/cover",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllQuery: useGetAllUsersQuery,
  useGetByIdQuery: useGetUserByIdQuery,
  useSearchQuery: useSearchUsersQuery,
  useCreateMutation: useCreateUserMutation,
  useUpdateMutation: useUpdateUserMutation,
  useDeleteMutation: useDeleteUserMutation,

  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useUpdateCoverMutation,
} = userApi;
