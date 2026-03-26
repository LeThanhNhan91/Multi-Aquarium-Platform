import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { ApiResponse } from "@/types/baseModel";
import {
  PostFeed,
  PostFeedResponse,
  PostCommentResponse,
  CreatePostRequest,
} from "@/types/post.type";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Post", "PostComments", "LikedPosts"],
  endpoints: (builder) => ({
    // Feed
    getFeed: builder.query<
      ApiResponse<PostFeedResponse>,
      { page: number; size: number }
    >({
      query: ({ page, size }) => `/post/feed?page=${page}&size=${size}`,
      providesTags: ["Post"],
    }),

    // Store Posts
    getStorePosts: builder.query<
      ApiResponse<PostFeedResponse>,
      { storeId: string; page: number; size: number }
    >({
      query: ({ storeId, page, size }) => `/post/store/${storeId}?page=${page}&size=${size}`,
      providesTags: (result, error, { storeId }) => [
        { type: "Post", id: `STORE_${storeId}` },
      ],
    }),

    // Liked (saved) posts
    getLikedPosts: builder.query<
      ApiResponse<PostFeedResponse>,
      { page: number; size: number }
    >({
      query: ({ page, size }) => `/post/liked?page=${page}&size=${size}`,
      providesTags: ["LikedPosts"],
    }),

    getPostById: builder.query<ApiResponse<PostFeed>, string>({
      query: (postId) => `/post/${postId}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    // Toggle like
    toggleLike: builder.mutation<ApiResponse<{ isLiked: boolean }>, string>({
      query: (postId) => ({
        url: `/post/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Post", "LikedPosts"],
    }),

    // Comments
    getComments: builder.query<
      ApiResponse<PostCommentResponse>,
      { postId: string; page: number; size: number }
    >({
      query: ({ postId, page, size }) =>
        `/post/${postId}/comments?page=${page}&size=${size}`,
      providesTags: (result, error, { postId }) => [
        { type: "PostComments", id: postId },
      ],
    }),

    addComment: builder.mutation<
      ApiResponse<{
        id: string;
        content: string;
        userName: string;
        createdAt: string;
      }>,
      { postId: string; content: string }
    >({
      query: ({ postId, content }) => ({
        url: `/post/${postId}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "PostComments", id: postId },
        "Post",
      ],
    }),

    // Store: Create post
    createPost: builder.mutation<ApiResponse<PostFeed>, CreatePostRequest>({
      query: (request) => {
        const formData = new FormData();
        formData.append("storeId", request.storeId);
        formData.append("content", request.content);
        if (request.mediaFiles) {
          request.mediaFiles.forEach((file) =>
            formData.append("mediaFiles", file),
          );
        }
        return {
          url: "/post",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Post"],
    }),

    // Store: Delete post
    deletePost: builder.mutation<ApiResponse<null>, string>({
      query: (postId) => ({
        url: `/post/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetStorePostsQuery,
  useGetLikedPostsQuery,
  useGetPostByIdQuery,
  useToggleLikeMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useCreatePostMutation,
  useDeletePostMutation,
} = postApi;
