"use client";

import { useState } from "react";
import Link from "next/link";
import { Fish, Menu, X, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Fish className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-serif text-foreground tracking-tight">
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
            Categories
          </Link>
          <Link
            href="#products"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Products
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            About
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
            className="text-foreground/70 hover:text-primary"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Button>
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
        </div>
      </div>
    </header>
  );
}
