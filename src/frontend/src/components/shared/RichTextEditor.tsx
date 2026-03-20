"use client";

import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Type,
  Smile,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  tooltip,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip: string;
}) => (
  <TooltipProvider delayDuration={400}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-8 w-8 p-0 rounded-md transition-all",
            isActive
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Viết gì đó khách hàng sẽ thấy thú vị...",
  className,
}: RichTextEditorProps) {
  const { theme } = useTheme();
  const [linkUrl, setLinkUrl] = React.useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: "color: #2563eb; text-decoration: underline; cursor: pointer;",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      BubbleMenuExtension,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      handleDOMEvents: {
        click: (view, event) => {
          if (event.ctrlKey || event.metaKey) {
            const target = event.target as HTMLElement;
            const link = target.closest("a");
            if (link) {
              window.open(link.href, "_blank");
              return true;
            }
          }
          return false;
        },
      },
      attributes: {
        class: cn(
          "focus:outline-none min-h-[150px] px-4 py-3 text-sm",
          className
        ),
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full border rounded-xl overflow-hidden bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all rich-text-editor-container">
      <style>{`
        .rich-text-editor-container a, 
        .rich-text-editor-container .tiptap a {
          color: #2563eb !important;
          text-decoration: underline !important;
          cursor: pointer !important;
          font-weight: 500;
        }
        .tiptap p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 border-b bg-muted/30">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          tooltip="In đậm (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          tooltip="In nghiêng (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          tooltip="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-4 bg-border mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          tooltip="Danh sách dấu chấm"
        >
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          tooltip="Danh sách số"
        >
          <ListOrdered className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-4 bg-border mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-md transition-all",
                editor.isActive("link")
                  ? "bg-primary/15 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" side="top" align="start">
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <Label htmlFor="link-url" className="text-xs font-semibold">Gắn liên kết</Label>
                <div className="flex gap-2">
                  <Input
                    id="link-url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="h-8 text-xs flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
                    }}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {editor.isActive("link") && (
          <MenuButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            tooltip="Bỏ liên kết"
          >
            <Unlink className="h-4 w-4" />
          </MenuButton>
        )}

        <div className="w-px h-4 bg-border mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 border-none w-auto" side="top" align="start">
            <EmojiPicker
              theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
              onEmojiClick={(emojiData) => {
                editor?.chain().focus().insertContent(emojiData.emoji).run();
              }}
              lazyLoadEmojis={true}
            />
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="Hoàn tác"
        >
          <Undo className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="Làm lại"
        >
          <Redo className="h-4 w-4" />
        </MenuButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Bubble Menu for quick access */}
      {editor && (
        <BubbleMenu
          editor={editor}
          className="bg-background border rounded-lg shadow-xl p-1 flex items-center gap-1"
        >
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            tooltip="In đậm"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            tooltip="In nghiêng"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-md transition-all",
                  editor.isActive("link")
                    ? "bg-primary/15 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" side="top" align="center">
              <div className="flex flex-col gap-3">
                <div className="space-y-1">
                  <Label htmlFor="bubble-link-url" className="text-xs font-semibold">Gắn liên kết</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bubble-link-url"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="h-8 text-xs flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
                      }}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </BubbleMenu>
      )}
    </div>
  );
}
