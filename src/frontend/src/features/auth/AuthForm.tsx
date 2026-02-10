"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Fish,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Store,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";
import { useLoginMutation, useRegisterMutation } from "@/services/authApi";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { tokenCookies } from "@/utils/cookies";

type Mode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // API mutations
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const router = useRouter();
  const { toast } = useToast();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };

    let isValid = true;

    if (mode === "register") {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
        isValid = false;
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
        isValid = false;
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (mode === "register") {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "login") {
        const response = await login({
          email: formData.email,
          password: formData.password,
        }).unwrap();

        // Store tokens in secure cookies instead of localStorage
        tokenCookies.setAccessToken(response.accessToken);
        tokenCookies.setRefreshToken(response.refreshToken);

        toast({
          title: "Login successful!",
          description: `Welcome back, ${response.fullName}!`,
        });

        // Redirect to home or dashboard
        router.push("/");
      } else {
        // Register - note: confirmPassword is NOT sent to API
        const response = await register({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }).unwrap();

        toast({
          title: "Registration successful!",
          description: response.message,
        });

        setMode("login");

        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: mode === "login" ? "Login failed" : "Registration failed",
        description:
          error?.data?.message || "An error occurred. Please try again.",
      });
    }
  };

  // Reset form when switching modes
  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <img
            src="/images/login-bg.jpg"
            alt="Underwater scene"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-br from-foreground/80 via-foreground/50 to-primary/30" />
        </div>

        {/* Floating bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/20 animate-bubble"
              style={{
                width: `${Math.random() * 16 + 8}px`,
                height: `${Math.random() * 16 + 8}px`,
                left: `${Math.random() * 100}%`,
                bottom: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${Math.random() * 6 + 8}s`,
              }}
            />
          ))}
        </div>

        <div className="relative flex flex-col justify-between p-12 z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Fish className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-serif text-background">
              MultiAqua
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold font-serif text-background leading-tight mb-6">
              Your Gateway to the Aquatic World
            </h2>
            <p className="text-base leading-relaxed text-background/60">
              Join Vietnam&apos;s largest aquarium marketplace. Connect with
              500+ verified shops and discover 10,000+ species of fish and
              aquatic life.
            </p>

            <div className="flex gap-6 mt-10">
              <div className="rounded-xl bg-background/10 backdrop-blur-sm p-4 flex-1">
                <p className="text-2xl font-bold font-serif text-background">
                  500+
                </p>
                <p className="text-xs text-background/50 mt-1">
                  Verified Shops
                </p>
              </div>
              <div className="rounded-xl bg-background/10 backdrop-blur-sm p-4 flex-1">
                <p className="text-2xl font-bold font-serif text-background">
                  10K+
                </p>
                <p className="text-xs text-background/50 mt-1">Fish Species</p>
              </div>
              <div className="rounded-xl bg-background/10 backdrop-blur-sm p-4 flex-1">
                <p className="text-2xl font-bold font-serif text-background">
                  50K+
                </p>
                <p className="text-xs text-background/50 mt-1">Customers</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-background/30">
            2026 MultiAqua. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full flex-col lg:w-1/2 bg-background">
        <div className="flex items-center justify-between p-6 lg:p-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Fish className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-serif text-foreground">
              MultiAqua
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-bold font-serif text-foreground">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Sign in to access your aquarium marketplace account."
                  : "Join the community and start exploring premium aquatics."}
              </p>
            </div>

            {/* User type toggle (register only) */}
            {/* {mode === "register" && (
              <div className="mb-6">
                <Label className="text-sm font-medium text-foreground mb-3 block">
                  I want to
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("buyer")}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                      userType === "buyer"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <User
                      className={cn(
                        "h-5 w-5",
                        userType === "buyer"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    <div className="text-left">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          userType === "buyer"
                            ? "text-primary"
                            : "text-foreground",
                        )}
                      >
                        Buy
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Shop for aquatics
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("seller")}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                      userType === "seller"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <Store
                      className={cn(
                        "h-5 w-5",
                        userType === "seller"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    <div className="text-left">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          userType === "seller"
                            ? "text-primary"
                            : "text-foreground",
                        )}
                      >
                        Sell
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Open a shop
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )} */}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {mode === "register" && (
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-foreground"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="pl-10 h-11 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="pl-10 h-11 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {mode === "register" && (
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-foreground"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="pl-10 h-11 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {mode === "register" && (
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="pl-10 h-11 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoginLoading || isRegisterLoading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold mt-1"
              >
                {isLoginLoading || isRegisterLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11 rounded-xl border-border bg-transparent text-foreground hover:bg-muted gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl border-border bg-transparent text-foreground hover:bg-muted gap-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  {"Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("register")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign up for free
                  </button>
                </>
              ) : (
                <>
                  {"Already have an account? "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("login")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
