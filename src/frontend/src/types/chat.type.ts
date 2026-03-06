export interface ConversationDto {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MessageDto {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

/** A local message entry used in the chat UI (may be optimistic or from server) */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isOwn: boolean;
}
