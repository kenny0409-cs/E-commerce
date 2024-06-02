import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { userApi } from './userApi';



export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1"}),
  endpoints: (builder) => ({
    //post request, use mutation
    login : builder.mutation({
        query(body) {
            return {
                url: "/login",
                method: "POST",
                body,
            };
        },
        //authenticating step
        //after logging have to quickly set the user in the login and redirect the user
        async onQueryStarted(args, { dispatch, queryFulfilled}) {
            try {
                //once the query fulfilled,
                //meaning successfully logged in
                await queryFulfilled;
                await dispatch(userApi.endpoints.getUser.initiate(null));
            }catch (error) {
                console.log(error);
            }
        }
    }),
    //register user
    register: builder.mutation({
        query(body) {
            return {
                url: "/register",
                method: "POST",
                body,
            };
        },
        //authenticating step
        //after registering have to quickly set the user in the login and redirect the user
        async onQueryStarted(args, { dispatch, queryFulfilled}) {
            try {
                //once the query fulfilled,
                //meaning successfully logged in
                await queryFulfilled;
                await dispatch(userApi.endpoints.getUser.initiate(null));
            }catch (error) {
                console.log(error);
            }
        }
    }),
    logout : builder.query({
        query: () => "/logout",
    }),
  }),
}); 

export const { useLoginMutation, useRegisterMutation, useLazyLogoutQuery } = authApi;