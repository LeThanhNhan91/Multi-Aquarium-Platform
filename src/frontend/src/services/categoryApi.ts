import { buildCrudEndpoints } from "@/libs/redux/baseCrudApi";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";
import { CategoryItem } from "@/types/category.type";
import { ApiResponse, PagedResult, PaginatedParams } from "@/types/baseModel";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    ...buildCrudEndpoints<CategoryItem>(builder, {
      resourcePath: "categories",
      tagType: "Category",
    }),

    getParentCategories: builder.query<
      ApiResponse<PagedResult<CategoryItem>>,
      PaginatedParams
    >({
      query: (params) => ({
        url: "/categories/parent",
        params,
      }),
    }),
  }),
});

export const {
  useGetAllQuery: useGetAllCategoriesQuery,
  useGetByIdQuery: useGetCategoryByIdQuery,
  useSearchQuery: useSearchCategoriesQuery,
  useCreateMutation: useCreateCategoryMutation,
  useUpdateMutation: useUpdateCategoryMutation,
  useDeleteMutation: useDeleteCategoryMutation,

  useGetParentCategoriesQuery,
} = categoryApi;
