import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { ConversationDto, MessageDto } from "@/types/chat.type";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Conversations", "Messages"],
  endpoints: (builder) => ({
    getMyConversations: builder.query<ConversationDto[], void>({
      query: () => "/chat/my-conversations",
      transformResponse: (response: any) => response?.data ?? [],
      providesTags: ["Conversations"],
    }),

    getStoreConversations: builder.query<ConversationDto[], string>({
      query: (storeId) => `/chat/store/${storeId}/conversations`,
      transformResponse: (response: any) => response?.data ?? [],
      providesTags: ["Conversations"],
    }),

    getMessages: builder.query<MessageDto[], string>({
      query: (conversationId) =>
        `/chat/conversations/${conversationId}/messages`,
      transformResponse: (response: any) => response?.data ?? [],
      providesTags: (_, __, conversationId) => [
        { type: "Messages", id: conversationId },
      ],
    }),
  }),
});

export const {
  useGetMyConversationsQuery,
  useGetStoreConversationsQuery,
  useGetMessagesQuery,
} = chatApi;
