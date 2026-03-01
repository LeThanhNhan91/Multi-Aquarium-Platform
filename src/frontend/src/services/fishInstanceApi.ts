import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { ApiResponse } from "@/types/baseModel";
import {
  FishInstance,
  CreateFishInstanceRequest,
  UpdateFishInstanceRequest,
} from "@/types/product.type";

export const fishInstanceApi = createApi({
  reducerPath: "fishInstanceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["FishInstance"],
  endpoints: (builder) => ({
    getFishInstances: builder.query<FishInstance[], string>({
      query: (productId) => `/products/${productId}/fish-instances`,
      transformResponse: (response: ApiResponse<FishInstance[]>) =>
        response.data,
      providesTags: (result, _err, productId) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "FishInstance" as const,
                id,
              })),
              { type: "FishInstance", id: `LIST-${productId}` },
            ]
          : [{ type: "FishInstance", id: `LIST-${productId}` }],
    }),

    getFishInstanceById: builder.query<
      FishInstance,
      { productId: string; fishInstanceId: string }
    >({
      query: ({ productId, fishInstanceId }) =>
        `/products/${productId}/fish-instances/${fishInstanceId}`,
      transformResponse: (response: ApiResponse<FishInstance>) => response.data,
      providesTags: (_res, _err, { fishInstanceId }) => [
        { type: "FishInstance", id: fishInstanceId },
      ],
    }),

    createFishInstance: builder.mutation<
      FishInstance,
      { productId: string; data: CreateFishInstanceRequest }
    >({
      query: ({ productId, data }) => {
        const formData = new FormData();
        formData.append("Price", data.price.toString());
        formData.append("Size", data.size);
        if (data.color) formData.append("Color", data.color);
        if (data.features) formData.append("Features", data.features);
        if (data.gender) formData.append("Gender", data.gender);
        if (data.images) {
          data.images.forEach((file) => formData.append("Images", file));
        }
        if (data.video) formData.append("Video", data.video);

        return {
          url: `/products/${productId}/fish-instances`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<FishInstance>) => response.data,
      invalidatesTags: (_res, _err, { productId }) => [
        { type: "FishInstance", id: `LIST-${productId}` },
      ],
    }),

    updateFishInstance: builder.mutation<
      FishInstance,
      { productId: string; fishInstanceId: string; data: UpdateFishInstanceRequest }
    >({
      query: ({ productId, fishInstanceId, data }) => ({
        url: `/products/${productId}/fish-instances/${fishInstanceId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<FishInstance>) => response.data,
      invalidatesTags: (_res, _err, { productId, fishInstanceId }) => [
        { type: "FishInstance", id: fishInstanceId },
        { type: "FishInstance", id: `LIST-${productId}` },
      ],
    }),

    deleteFishInstance: builder.mutation<
      void,
      { productId: string; fishInstanceId: string }
    >({
      query: ({ productId, fishInstanceId }) => ({
        url: `/products/${productId}/fish-instances/${fishInstanceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { productId, fishInstanceId }) => [
        { type: "FishInstance", id: fishInstanceId },
        { type: "FishInstance", id: `LIST-${productId}` },
      ],
    }),

    addFishInstanceMedia: builder.mutation<
      void,
      { productId: string; fishInstanceId: string; images: File[] }
    >({
      query: ({ productId, fishInstanceId, images }) => {
        const formData = new FormData();
        images.forEach((file) => formData.append("Images", file));
        return {
          url: `/products/${productId}/fish-instances/${fishInstanceId}/media`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_res, _err, { productId, fishInstanceId }) => [
        { type: "FishInstance", id: fishInstanceId },
        { type: "FishInstance", id: `LIST-${productId}` },
      ],
    }),

    deleteFishInstanceMedia: builder.mutation<
      void,
      { productId: string; fishInstanceId: string; mediaId: string }
    >({
      query: ({ productId, fishInstanceId, mediaId }) => ({
        url: `/products/${productId}/fish-instances/${fishInstanceId}/media/${mediaId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { productId, fishInstanceId }) => [
        { type: "FishInstance", id: fishInstanceId },
        { type: "FishInstance", id: `LIST-${productId}` },
      ],
    }),
  }),
});

export const {
  useGetFishInstancesQuery,
  useGetFishInstanceByIdQuery,
  useCreateFishInstanceMutation,
  useUpdateFishInstanceMutation,
  useDeleteFishInstanceMutation,
  useAddFishInstanceMediaMutation,
  useDeleteFishInstanceMediaMutation,
} = fishInstanceApi;
