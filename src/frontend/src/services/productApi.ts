import { buildCrudEndpoints } from "@/libs/redux/baseCrudApi";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";
import { ProductItem } from "@/types/product.type";
import { ApiResponse, PagedResult } from "@/types/baseModel";

export interface ProductParams {
  pageIndex?: number;
  pageSize?: number;
  Keyword?: string;
  MinPrice?: number;
  MaxPrice?: number;
  AverageRating?: number;
  CategoryId?: string;
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
        if (params.CategoryId)
          queryParams.append("CategoryId", params.CategoryId);
        if (params.SortBy) queryParams.append("SortBy", params.SortBy);
        if (params.IsDescending !== undefined)
          queryParams.append("IsDescending", params.IsDescending.toString());

        return {
          url: `/${resourcePath}`,
          params: queryParams,
        };
      },
    }),
  }),
});

export const {
  useGetAllQuery: useGetAllProductsQuery,
  useGetByIdQuery: useGetProductByIdQuery,
  useSearchQuery: useSearchProductsQuery,
  useCreateMutation: useCreateProductMutation,
  useUpdateMutation: useUpdateProductMutation,
  useDeleteMutation: useDeleteProductMutation,
} = productApi;
