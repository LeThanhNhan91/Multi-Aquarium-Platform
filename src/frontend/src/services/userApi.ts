import { buildCrudEndpoints } from "@/libs/redux/baseCrudApi";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { UserProfile } from "@/types/user.type";
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
} = userApi;
