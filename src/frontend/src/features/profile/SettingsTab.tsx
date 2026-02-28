"use client";

import { Badge } from "@/components/ui/badge";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/userApi";
import { useToast } from "@/hooks/use-toast";
import { FishLoading } from "@/app/Loading";

export function SettingsTab() {
  const { data: profileResponse, isLoading: isLoadingProfile } =
    useGetProfileQuery();
  const userProfile = profileResponse?.data;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { toast } = useToast();

  // Populate form when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phoneNumber: userProfile.phoneNumber || "",
        address: userProfile.address || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
    };

    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address || undefined,
      }).unwrap();

      toast({
        title: "Profile updated!",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description:
          error?.data?.message || "Failed to update profile. Please try again.",
      });
    }
  };

  return (
    <>
      <FishLoading isLoading={isLoadingProfile} />
      <div className="flex flex-col gap-6">
        {/* Personal Info */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-bold  text-foreground">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Update your personal details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-foreground"
                >
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className="pl-10 h-11 rounded-xl border-border bg-background text-foreground focus-visible:ring-primary"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-foreground"
                >
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className="pl-10 h-11 rounded-xl border-border bg-background text-foreground focus-visible:ring-primary"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className="pl-10 h-11 rounded-xl border-border bg-background text-foreground focus-visible:ring-primary"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-foreground"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="pl-10 h-11 rounded-xl border-border bg-background text-foreground focus-visible:ring-primary"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium text-foreground"
                >
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    className="pl-10 h-11 rounded-xl border-border bg-background text-foreground focus-visible:ring-primary"
                  />
                </div>
                {errors.address && (
                  <p className="text-xs text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isUpdating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-bold  text-foreground">
                  Notifications
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Choose what you want to be notified about
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              {
                label: "Order Updates",
                desc: "Get notified when your order status changes",
                defaultChecked: true,
              },
              {
                label: "Price Drops",
                desc: "Alert me when wishlist items go on sale",
                defaultChecked: true,
              },
              {
                label: "New Arrivals",
                desc: "Notify me about new fish and products",
                defaultChecked: false,
              },
              {
                label: "Shop Promotions",
                desc: "Receive promotional offers from followed shops",
                defaultChecked: false,
              },
            ].map((item, i, arr) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
                {i < arr.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security & Payment */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold  text-foreground">
                    Security
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Manage account security
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-border text-foreground hover:bg-muted gap-2"
              >
                <Shield className="h-4 w-4 text-muted-foreground" />
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-border text-foreground hover:bg-muted gap-2"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold  text-foreground">
                    Payment Methods
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Manage your payment options
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    VISA
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      **** 4289
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires 08/27
                    </p>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-0 text-xs">
                  Default
                </Badge>
              </div>
              <Button
                variant="outline"
                className="w-full bg-transparent border-border text-foreground hover:bg-muted gap-2"
              >
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
