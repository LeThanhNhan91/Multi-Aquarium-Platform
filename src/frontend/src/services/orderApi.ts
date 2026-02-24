import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { ApiResponse, PagedResult } from "@/types/baseModel";
import {
  CreateOrderRequest,
  GetOrdersFilter,
  OrderResponse,
  OrderDetailResponse,
  CreatePaymentUrlRequest,
  PaymentLinkDto,
} from "@/types/order.type";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    createOrder: builder.mutation<ApiResponse<OrderResponse>, CreateOrderRequest>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),

    getOrders: builder.query<ApiResponse<PagedResult<OrderResponse>>, GetOrdersFilter>({
      query: (filter) => ({
        url: "/orders",
        params: filter,
      }),
      providesTags: [{ type: "Order", id: "LIST" }],
    }),

    getOrderById: builder.query<ApiResponse<OrderDetailResponse>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    createPaymentUrl: builder.mutation<
      PaymentLinkDto,
      CreatePaymentUrlRequest
    >({
      query: (body) => ({
        url: "/payment/create-url",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useCreatePaymentUrlMutation,
} = orderApi;
