import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
  reducerPath: "orderApi",
  tagTypes: ["Order", "AdminOrder"],
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  endpoints: (builder) => ({
    createNewOrder: builder.mutation({
      query(body) {
        return {
          url: "/orders/new",
          method: "POST",
          body,
        };
      },
    }),
    myOrders: builder.query({
      query: () => "/me/orders",
    }),
    orderDetails: builder.query({
      query: (id) => `/orders/${id}`,
    }),
    updateOrder: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/orders/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Order"],
    }),
    deleteOrder: builder.mutation({
      query(id) {
        return {
          url: `/admin/orders/${id}`,
          method: "DELETE",

        };
      },
      invalidatesTags: ["AdminOrder"],
    }),
    stripeCheckoutSession : builder.mutation({
      query(body) {
        return {
          url: "/payment/checkout_session",
          method: "POST",
          body,
        };
      },
    }),
    getDashboardSales: builder.query({
      query: ({startDate, endDate}) => `/admin/get_sales/?startDate=${startDate}&endDate=${endDate}`,
    }),
    getAdminOrders: builder.query({
      query: () => `/admin/orders`,
      providesTags: ["AdminOrder"]
    }),
  }),
});

export const { useDeleteOrderMutation,useUpdateOrderMutation,useGetAdminOrdersQuery,useLazyGetDashboardSalesQuery,useOrderDetailsQuery,useMyOrdersQuery,useCreateNewOrderMutation, useStripeCheckoutSessionMutation } = orderApi;