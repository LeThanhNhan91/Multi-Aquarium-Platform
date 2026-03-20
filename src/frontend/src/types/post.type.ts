export interface PostMedia {
  id: string;
  url: string;
  type: "Image" | "Video";
}

export interface PostFeed {
  id: string;
  storeId: string;
  storeName: string;
  logoUrl: string | null;
  content: string;
  createdAt: string;
  media: PostMedia[];
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
}

export interface PostFeedResponse {
  items: PostFeed[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface PostCommentResponse {
  items: PostComment[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface CreatePostRequest {
  storeId: string;
  content: string;
  mediaFiles?: File[];
}
