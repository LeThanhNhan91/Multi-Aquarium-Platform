import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  CreateStoreRequest,
  GetStoresFilter,
  StoreResponse,
  UpdateStoreInfoRequest,
  UpdateStoreMediaResponse,
} from "@/types/store.type";
import { ApiResponse, PagedResult } from "@/types/baseModel";

export const storeApi = createApi({
  reducerPath: "storeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Stores", "Profile"],
  endpoints: (builder) => ({
    getStores: builder.query<PagedResult<StoreResponse>, GetStoresFilter>({
      query: (filter) => ({
        url: "/Stores",
        params: filter,
      }),
      transformResponse: (response: ApiResponse<PagedResult<StoreResponse>>) =>
        response.data,
      providesTags: ["Stores"],
    }),

    createStore: builder.mutation<StoreResponse, CreateStoreRequest>({
      query: (request) => ({
        url: "/Stores",
        method: "POST",
        body: request,
      }),
      transformResponse: (response: ApiResponse<StoreResponse>) =>
        response.data,
      invalidatesTags: ["Stores", "Profile"],
    }),

    updateStoreInfo: builder.mutation<
      void,
      { id: string; request: UpdateStoreInfoRequest }
    >({
      query: ({ id, request }) => ({
        url: `/Stores/${id}/info`,
        method: "PUT",
        body: request,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Stores", id },
        "Stores",
      ],
    }),

    updateStoreLogo: builder.mutation<
      UpdateStoreMediaResponse,
      { id: string; logo: File }
    >({
      query: ({ id, logo }) => {
        const formData = new FormData();
        formData.append("Logo", logo);
        return {
          url: `/Stores/${id}/logo`,
          method: "PUT",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<UpdateStoreMediaResponse>) =>
        response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Stores", id },
        "Stores",
      ],
    }),

    updateStoreCover: builder.mutation<
      UpdateStoreMediaResponse,
      { id: string; cover: File }
    >({
      query: ({ id, cover }) => {
        const formData = new FormData();
        formData.append("Cover", cover);
        return {
          url: `/Stores/${id}/cover`,
          method: "PUT",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<UpdateStoreMediaResponse>) =>
        response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Stores", id },
        "Stores",
      ],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreInfoMutation,
  useUpdateStoreLogoMutation,
  useUpdateStoreCoverMutation,
} = storeApi;
