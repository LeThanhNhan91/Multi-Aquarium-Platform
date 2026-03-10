"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Added import for next/image
import { User, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/libs/redux/features/authSlice";
import { cn } from "@/utils/utils";

interface UserMenuProps {
  user: {
    fullName: string;
    avatarUrl?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    router.replace("/");
  };

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  console.log(user.fullName);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.fullName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover border-2 border-primary/20"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold border-2 border-primary/20">
            {getInitials(user.fullName)}
          </div>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              {user.fullName}
            </p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
