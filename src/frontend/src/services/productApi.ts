import { buildCrudEndpoints } from "@/libs/redux/baseCrudApi";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";
import { ProductItem, CreateProductRequest } from "@/types/product.type";
import { ApiResponse, PagedResult } from "@/types/baseModel";

export interface ProductParams {
  pageIndex?: number;
  pageSize?: number;
  Keyword?: string;
  MinPrice?: number;
  MaxPrice?: number;
  AverageRating?: number;
  CategoryIds?: string[];
  StoreId?: string;
  SortBy?: "name" | "price" | "averagerating" | "totalreviews" | "newest";
  IsDescending?: boolean;
}

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    ...buildCrudEndpoints<ProductItem, ProductParams>(builder, {
      resourcePath: "products",
      tagType: "Product",
      buildGetAllQuery: (params, resourcePath) => {
        const queryParams = new URLSearchParams();
        if (params.pageIndex)
          queryParams.append("pageIndex", params.pageIndex.toString());
        if (params.pageSize)
          queryParams.append("pageSize", params.pageSize.toString());
        if (params.Keyword) queryParams.append("Keyword", params.Keyword);
        if (params.MinPrice !== undefined)
          queryParams.append("MinPrice", params.MinPrice.toString());
        if (params.MaxPrice !== undefined)
          queryParams.append("MaxPrice", params.MaxPrice.toString());
        if (params.AverageRating !== undefined)
          queryParams.append("AverageRating", params.AverageRating.toString());
        if (params.CategoryIds && params.CategoryIds.length > 0) {
          params.CategoryIds.forEach((id) =>
            queryParams.append("CategoryIds", id),
          );
        }
        if (params.StoreId) queryParams.append("StoreId", params.StoreId);
        if (params.SortBy) queryParams.append("SortBy", params.SortBy);
        if (params.IsDescending !== undefined)
          queryParams.append("IsDescending", params.IsDescending.toString());

        return {
          url: `/${resourcePath}`,
          params: queryParams,
        };
      },
    }),

    createProduct: builder.mutation<
      ProductItem,
      CreateProductRequest | FormData
    >({
      query: (data) => {
        if (data instanceof FormData) {
          return {
            url: "/products",
            method: "POST",
            body: data,
          };
        }

        const formData = new FormData();
        formData.append("Name", data.name);
        formData.append("CategoryId", data.categoryId);
        if (data.description) formData.append("Description", data.description);
        if (data.basePrice !== undefined)
          formData.append("BasePrice", data.basePrice.toString());

        if (data.images) {
          data.images.forEach((file) => {
            formData.append("Images", file);
          });
        }

        return {
          url: "/products",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<ProductItem>) => response.data,
      invalidatesTags: ["Product"],
    }),
    getStoreProducts: builder.query<
      PagedResult<ProductItem>,
      { storeId: string } & ProductParams
    >({
      query: ({ storeId, ...params }) => {
        const queryParams = new URLSearchParams();
        if (params.pageIndex)
          queryParams.append("pageIndex", params.pageIndex.toString());
        if (params.pageSize)
          queryParams.append("pageSize", params.pageSize.toString());
        if (params.Keyword) queryParams.append("Keyword", params.Keyword);
        if (params.MinPrice !== undefined)
          queryParams.append("MinPrice", params.MinPrice.toString());
        if (params.MaxPrice !== undefined)
          queryParams.append("MaxPrice", params.MaxPrice.toString());
        if (params.AverageRating !== undefined)
          queryParams.append("AverageRating", params.AverageRating.toString());
        if (params.CategoryIds && params.CategoryIds.length > 0) {
          params.CategoryIds.forEach((id) =>
            queryParams.append("CategoryIds", id),
          );
        }
        if (params.SortBy) queryParams.append("SortBy", params.SortBy);
        if (params.IsDescending !== undefined)
          queryParams.append("IsDescending", params.IsDescending.toString());

        return {
          url: `/products/stores/${storeId}`,
          params: queryParams,
          headers: {
            "X-Force-Store-Context": "true",
          },
        };
      },
      transformResponse: (response: ApiResponse<PagedResult<ProductItem>>) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Product" as const,
                id,
              })),
              { type: "Product", id: "PARTIAL-LIST" },
            ]
          : [{ type: "Product", id: "PARTIAL-LIST" }],
    }),
  }),
});

export const {
  useGetAllQuery: useGetAllProductsQuery,
  useGetByIdQuery: useGetProductByIdQuery,
  useSearchQuery: useSearchProductsQuery,
  useCreateProductMutation,
  useGetStoreProductsQuery,
  useUpdateMutation: useUpdateProductMutation,
  useDeleteMutation: useDeleteProductMutation,
} = productApi;
