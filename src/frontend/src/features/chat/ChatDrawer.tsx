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
import { Send, MessageSquare, Loader2, WifiOff } from "lucide-react";
import { tokenCookies } from "@/utils/cookies";
import {
  useGetMyConversationsQuery,
  useGetMessagesQuery,
} from "@/services/chatApi";
import { ChatMessage } from "@/types/chat.type";
import { cn } from "@/utils/utils";
import { format } from "date-fns";

function parseUtcDate(ts: string): Date {
  return new Date(ts.endsWith("Z") ? ts : ts + "Z");
}

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
}

function getCurrentUserId(): string {
  const token = tokenCookies.getAccessToken();
  if (!token) return "";
  try {
    const base64Url = token.split(".")[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
    return payload.sub ?? payload.nameid ?? "";
  } catch {
    return "";
  }
}

export function ChatDrawer({ open, onClose, storeId, storeName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUserId = useRef(getCurrentUserId());
  const historyLoaded = useRef(false);

  // Find existing conversation with this store
  const { data: conversations } = useGetMyConversationsQuery(undefined, {
    skip: !open,
  });
  const existingConversation = conversations?.find(
    (c) => c.partnerId === storeId,
  );

  // Load message history once per open session
  const { data: existingMessages } = useGetMessagesQuery(
    existingConversation?.id ?? "",
    { skip: !existingConversation || historyLoaded.current },
  );

  // Reset on open
  useEffect(() => {
    if (open) {
      setMessages([]);
      historyLoaded.current = false;
      currentUserId.current = getCurrentUserId();
    }
  }, [open]);

  // Populate from history
  useEffect(() => {
    if (existingMessages && existingMessages.length > 0 && !historyLoaded.current) {
      historyLoaded.current = true;
      const userId = currentUserId.current;
      setMessages(
        existingMessages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.senderId === userId ? "Bạn" : storeName,
          content: m.content,
          sentAt: m.createdAt,
          isOwn: m.senderId === userId,
        })),
      );
    }
  }, [existingMessages, storeName]);

  // SignalR connection lifecycle
  useEffect(() => {
    if (!open) return;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ?? "";

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/chatHub`, {
        accessTokenFactory: () => tokenCookies.getAccessToken() ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on(
      "ReceiveMessage",
      (
        senderId: string,
        senderName: string,
        content: string,
        sentAt: string,
      ) => {
        // Only add messages from the store (own messages are added optimistically)
        if (senderId !== currentUserId.current) {
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
        }
      },
    );

    connection.on("ReceiveError", (error: string) => {
      console.error("Chat error:", error);
    });

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
  }, [open]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !connectionRef.current || isSending) return;

    setInput("");
    setIsSending(true);

    const optimistic: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: currentUserId.current,
      senderName: "Bạn",
      content,
      sentAt: new Date().toISOString(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await connectionRef.current.invoke(
        "SendMessageToStore",
        storeId,
        content,
      );
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
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50 space-y-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base font-semibold text-foreground">
                {storeName}
              </SheetTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-muted-foreground/50",
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? "Đang hoạt động" : "Đang kết nối..."}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16 gap-3">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-primary/60" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Liên hệ với {storeName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Gửi tin nhắn để hỏi về sản phẩm hoặc đặt hàng
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.isOwn ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm wrap-break-word",
                    msg.isOwn
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm",
                  )}
                >
                  {!msg.isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-60">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] mt-1 opacity-60",
                      msg.isOwn ? "text-right" : "text-left",
                    )}
                  >
                    {format(parseUtcDate(msg.sentAt), "HH:mm")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-border/50 bg-background shrink-0">
          {!isConnected && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Mất kết nối – đang thử lại...</span>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-xl border-border/60 bg-secondary/30 focus-visible:ring-primary/50"
              disabled={!isConnected}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || !isConnected || isSending}
              size="icon"
              className="rounded-xl shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
