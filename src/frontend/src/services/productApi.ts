import { buildCrudEndpoints } from "@/libs/redux/baseCrudApi";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";
import { ProductItem } from "@/types/product.type";
export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    ...buildCrudEndpoints<ProductItem>(builder, {
      resourcePath: "products",
      tagType: "Product",
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
