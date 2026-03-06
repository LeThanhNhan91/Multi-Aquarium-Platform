"use client";

import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageSquare, Send, Loader2, User } from "lucide-react";
import {
  useGetMyConversationsQuery,
  useGetStoreConversationsQuery,
  useGetMessagesQuery,
  chatApi,
} from "@/services/chatApi";
import { ChatMessage, ConversationDto } from "@/types/chat.type";
import { tokenCookies } from "@/utils/cookies";
import { cn } from "@/utils/utils";
import { format } from "date-fns";
import { useAppDispatch } from "@/libs/redux/hook";

// Ensures timestamps without 'Z' are treated as UTC before formatting
function parseUtcDate(ts: string): Date {
  return new Date(ts.endsWith("Z") ? ts : ts + "Z");
}

function decodeJwtPayload(): Record<string, string> {
  const token = tokenCookies.getAccessToken();
  if (!token) return {};
  try {
    const base64Url = token.split(".")[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
  } catch {
    return {};
  }
}

function getCurrentUserId(): string {
  const p = decodeJwtPayload();
  return p.sub ?? p.nameid ?? "";
}

function getCurrentUserStoreId(): string {
  return decodeJwtPayload().storeId ?? "";
}

interface ConversationViewProps {
  conversation: ConversationDto;
  onBack: () => void;
  currentUserId: string;
  isStoreOwner: boolean;
  connection: signalR.HubConnection | null;
}

function ConversationView({
  conversation,
  onBack,
  currentUserId,
  isStoreOwner,
  connection,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyLoaded = useRef(false);

  const { data: existingMessages } = useGetMessagesQuery(conversation.id, {
    skip: !conversation.id,
  });

  // Populate history once
  useEffect(() => {
    historyLoaded.current = false;
    setMessages([]);
  }, [conversation.id]);

  useEffect(() => {
    if (existingMessages && !historyLoaded.current) {
      historyLoaded.current = true;
      setMessages(
        existingMessages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          senderName:
            m.senderId === currentUserId ? "Bạn" : conversation.partnerName,
          content: m.content,
          sentAt: m.createdAt,
          isOwn: m.senderId === currentUserId,
        })),
      );
    }
  }, [existingMessages, currentUserId, conversation.partnerName]);

  // Real-time: listen for messages belonging to this conversation.
  // For store owner: filter by conversation.partnerId (customerId === senderId).
  // For customer: accept any non-own message (staffId !== storeId unavoidable).
  useEffect(() => {
    if (!connection) return;
    const handler = (
      senderId: string,
      senderName: string,
      content: string,
      sentAt: string,
    ) => {
      if (senderId === currentUserId) return;
      if (isStoreOwner && senderId !== conversation.partnerId) return;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          senderId,
          senderName,
          content,
          sentAt,
          isOwn: false,
        },
      ]);
    };
    connection.on("ReceiveMessage", handler);
    return () => connection.off("ReceiveMessage", handler);
  }, [connection, currentUserId, isStoreOwner, conversation.partnerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !connection || isSending) return;

    setInput("");
    setIsSending(true);

    const optimistic: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: currentUserId,
      senderName: "Bạn",
      content,
      sentAt: new Date().toISOString(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      if (isStoreOwner) {
        await connection.invoke("SendMessageToCustomer", conversation.id, content);
      } else {
        await connection.invoke("SendMessageToStore", conversation.partnerId, content);
      }
    } catch (err) {
      console.error("Send error:", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground text-sm truncate">
          {conversation.partnerName}
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12 gap-2">
            <MessageSquare className="h-10 w-10 text-primary/30" />
            <p className="text-sm">Chưa có tin nhắn nào</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col gap-1",
              msg.isOwn ? "items-end" : "items-start",
            )}
          >
            <span className="text-xs text-muted-foreground px-1">
              {msg.senderName}
            </span>
            <div
              className={cn(
                "max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed",
                msg.isOwn
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm",
              )}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-muted-foreground px-1">
              {format(parseUtcDate(msg.sentAt), "HH:mm")}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-full text-sm"
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className="h-9 w-9 rounded-full shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ChatInboxProps {
  open: boolean;
  onClose: () => void;
}

export function ChatInbox({ open, onClose }: ChatInboxProps) {
  const dispatch = useAppDispatch();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isConnected, setIsConnected] = useState(false);
  const [storeId, setStoreId] = useState("");
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const currentUserId = useRef("");
  const currentStoreId = useRef("");

  useEffect(() => {
    if (open) {
      const uid = getCurrentUserId();
      const sid = getCurrentUserStoreId();
      currentUserId.current = uid;
      currentStoreId.current = sid;
      setStoreId(sid);
    }
  }, [open]);

  const isStoreOwner = !!storeId;

  const {
    data: customerConversations,
  } = useGetMyConversationsQuery(undefined, {
    skip: !open || isStoreOwner,
  });

  const {
    data: storeConversations,
  } = useGetStoreConversationsQuery(storeId, {
    skip: !open || !isStoreOwner,
  });

  const conversations = isStoreOwner ? storeConversations : customerConversations;
  const isLoading = !conversations;

  const selectedConversation = conversations?.find(
    (c) => c.id === selectedConversationId,
  );

  // Connect to SignalR when panel opens
  useEffect(() => {
    if (!open) return;
    currentUserId.current = getCurrentUserId();
    currentStoreId.current = getCurrentUserStoreId();

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ?? "";

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/chatHub`, {
        accessTokenFactory: () => tokenCookies.getAccessToken() ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // New conversation arrived (customer messaged store for first time) → refresh list
    connection.on(
      "ReceiveNewConversation",
      (_conversationId: string, _senderName: string, _content: string) => {
        dispatch(chatApi.util.invalidateTags(["Conversations"]));
      },
    );

    connectionRef.current = connection;

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => console.error("SignalR connect error:", err));

    return () => {
      connection.stop();
      connectionRef.current = null;
      setIsConnected(false);
    };
  }, [open, dispatch]);

  const handleClose = () => {
    setSelectedConversationId(null);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        {selectedConversationId && selectedConversation ? (
          <ConversationView
            conversation={selectedConversation}
            onBack={() => setSelectedConversationId(null)}
            currentUserId={currentUserId.current}
            isStoreOwner={isStoreOwner}
            connection={connectionRef.current}
          />
        ) : (
          <>
            <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50 space-y-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <SheetTitle className="text-base font-semibold">
                  Tin nhắn
                </SheetTitle>
                <div
                  className={cn(
                    "ml-auto h-2 w-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-muted-foreground/40",
                  )}
                />
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto divide-y divide-border/50">
              {isLoading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {!isLoading && (!conversations || conversations.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center gap-3 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 text-primary/20" />
                  <p className="text-sm font-medium">
                    Chưa có cuộc hội thoại nào
                  </p>
                  <p className="text-xs">
                    Hãy liên hệ cửa hàng để bắt đầu nhắn tin
                  </p>
                </div>
              )}

              {conversations?.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {conv.partnerName}
                      </span>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {format(parseUtcDate(conv.lastMessageAt), "HH:mm")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage || "Bắt đầu cuộc trò chuyện"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="h-5 min-w-5 rounded-full bg-primary flex items-center justify-center px-1.5 shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary-foreground">
                        {conv.unreadCount}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
