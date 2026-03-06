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
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:w-105 flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b flex-row items-center gap-2 space-y-0">
          <MessageSquare className="h-5 w-5 text-primary shrink-0" />
          <SheetTitle className="flex-1 text-left">{storeName}</SheetTitle>
          {isConnected ? (
            <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
          ) : (
            <WifiOff className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 pt-16">
              <MessageSquare className="h-12 w-12 opacity-20" />
              <p className="text-sm text-center">Bắt đầu cuộc trò chuyện với<br /><span className="font-medium">{storeName}</span></p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-1 max-w-[80%]",
                msg.isOwn ? "ml-auto items-end" : "items-start",
              )}
            >
              <span className="text-xs text-muted-foreground">{msg.senderName}</span>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm wrap-break-word",
                  msg.isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {msg.content}
              </div>
              <span className="text-xs text-muted-foreground">
                {format(parseUtcDate(msg.sentAt), "HH:mm")}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            disabled={!isConnected || isSending}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!isConnected || isSending || !input.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
