import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { setIsAuthenticated, setLoading, setUser} from '../features/userSlice';

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1"}),
  tagTypes: ["User","AdminUser","AdminUsers"],
  endpoints: (builder) => ({
    getUser : builder.query({
        query: () => `/me`,
        //modifying the response return by query or mutation
        transformResponse: (result) => result.user,
        async onQueryStarted(args, { dispatch, queryFulfilled}) {
          try {
             // Waiting for the API request to complete
            const {data} =await queryFulfilled;
            // Dispatching actions to update the Redux store with the user data and authentication status
            dispatch(setUser(data));
            dispatch(setIsAuthenticated(true));
            dispatch(setLoading(false));
          }catch (error) {
            dispatch(setLoading(false));
            console.log(error);
          }
        },
        providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query(body) {
        return {
          url: "/me/update",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["User"], //quickly update the tag that will refetch the data
    }),
    uploadAvatar: builder.mutation({
      query(body) {
        return {
          url: "/me/upload_avatar",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["User"], //quickly update the tag that will refetch the data
    }),
    updatePassword: builder.mutation({
      query(body){
        return {
          url: "/password/update",
          method: "PUT",
          body,
        };
      },
    }),
    ForgotPassword: builder.mutation({
      query(body){
        return {
          url: "/password/forgot",
          method: "POST",
          body,
        };
      },
    }),
    ResetPassword: builder.mutation({
      query({token, body}){
        return {
          url: `/password/reset/${token}`,
          method: "PUT",
          body,
        };
      },
    }),
    getAdminUsers: builder.query({
      query: () => `/admin/users`,
      providesTags: ["AdminUser"],
    }),
    deleteUser: builder.mutation({
      query(id) {
        return {
          url: `/admin/users/${id}`,
          method: "DELETE",

        };
      },
      invalidatesTags: ["AdminUser"],
    }),
    getUserDetails: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: ["AdminUsers"],
    }),
    updateUser: builder.mutation({
      query({id, body}){
        return {
          url: `/admin/users/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["AdminUser"],
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useGetUserDetailsQuery,
  useDeleteUserMutation,
  useGetAdminUsersQuery,
  useGetUserQuery, 
  useUpdateProfileMutation, 
  useUploadAvatarMutation, 
  useUpdatePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = userApi;

