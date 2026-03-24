"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Fish,
  Menu,
  X,
  ShoppingCart,
  Search,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { useGetProfileQuery } from "@/services/userApi";
import { UserMenu } from "./UserMenu";
import { tokenCookies } from "@/utils/cookies";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/libs/redux/features/authSlice";
import { toggleCart } from "@/libs/redux/features/cartSlice";
import { ChatInbox } from "../../features/chat/ChatInbox";
import { useAppSelector } from "@/libs/redux/hook";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const cartItems = useAppSelector((state) => state.cart.items);
  const cartItemCount = cartItems.length;

  // Check if user has token and fetch profile
  const hasToken = tokenCookies.hasTokens();
  const { data: userProfile, isLoading } = useGetProfileQuery(undefined, {
    skip: !hasToken,
  });

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("cart");
    router.replace("/");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Fish className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold  text-foreground tracking-tight">
              MultiAqua
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="#categories"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              Danh mục
            </Link>
            <Link
              href="#products"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              Sản phẩm
            </Link>
            <Link
              href="/feeds"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              Tin tức
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              Giới thiệu
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-primary"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-primary relative"
              onClick={() => dispatch(toggleCart())}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>

            {/* Message inbox — only for logged-in users */}
            {!isLoading && userProfile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-primary relative"
                onClick={() => setInboxOpen(true)}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Tin nhắn</span>
              </Button>
            )}

            {/* Show login buttons or user menu based on auth status */}
            {!isLoading && userProfile ? (
              <UserMenu user={userProfile.data} />
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </nav>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg",
            mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col gap-4 px-6 py-6">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/80 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#categories"
              className="text-sm font-medium text-foreground/80 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="#products"
              className="text-sm font-medium text-foreground/80 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Products
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-foreground/80 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>

            {/* Mobile auth section */}
            {!isLoading && userProfile ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    {userProfile.data.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">Signed in</p>
                </div>
                <Link href="/profile" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 text-primary bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChatInbox open={inboxOpen} onClose={() => setInboxOpen(false)} />
    </>
  );
}
