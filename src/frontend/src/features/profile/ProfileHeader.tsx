"use client";

import {
  Camera,
  MapPin,
  Calendar,
  Star,
  Settings,
  Share2,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  useGetProfileQuery,
  useUpdateAvatarMutation,
  useUpdateCoverMutation,
} from "@/services/userApi";
import { formatVietnameseDate } from "@/helper/formatter";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { FishLoading } from "@/app/Loading";

const stats = [
  { label: "Shops", value: "3" },
  { label: "Products", value: "147" },
  { label: "Orders", value: "1,986" },
  { label: "Revenue", value: "263.6M" },
];

export function ProfileHeader() {
  const { data: profileResponse, isLoading: isLoadingProfile } =
    useGetProfileQuery();
  const userProfile = profileResponse?.data;
  const { toast } = useToast();

  const [updateAvatar, { isLoading: isUploadingAvatar }] =
    useUpdateAvatarMutation();
  const [updateCover, { isLoading: isUploadingCover }] =
    useUpdateCoverMutation();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return "Please select an image file";
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    return null;
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: error,
      });
      return;
    }

    const formData = new FormData();
    formData.append("Avatar", file);

    try {
      await updateAvatar(formData).unwrap();
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error?.data?.message || "Failed to upload avatar.",
      });
    }

    // Clear input
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleCoverChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: error,
      });
      return;
    }

    const formData = new FormData();
    formData.append("Cover", file);

    try {
      await updateCover(formData).unwrap();
      toast({
        title: "Cover updated!",
        description: "Your cover image has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error?.data?.message || "Failed to upload cover image.",
      });
    }

    // Clear input
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  return (
    <>
      <FishLoading isLoading={isLoadingProfile} />
      <section className="relative">
        {/* Hidden file inputs */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />

        {/* Cover image */}
        <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
          <img
            src={userProfile?.coverUrl || "/images/hero-aquarium.jpg"}
            alt="Profile cover - beautiful planted aquarium"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/30 to-transparent" />

          {/* Cover edit button */}
          <Button
            size="sm"
            variant="outline"
            disabled={isUploadingCover}
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 bg-card/20 backdrop-blur-md border-background/20 text-background hover:bg-card/40 hover:text-background gap-2"
          >
            {isUploadingCover ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Uploading...</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Cover</span>
              </>
            )}
          </Button>
        </div>

        {/* Profile info bar */}
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 sm:-mt-12 pb-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                <AvatarImage
                  src={userProfile?.avatarUrl || "/images/product-koi.jpg"}
                  alt={userProfile?.fullName}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl ">
                  {userProfile?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "NT"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Change avatar"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold  text-foreground">
                  {userProfile?.fullName}
                </h1>
                <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
                <Badge className="bg-primary/10 text-primary border-0">
                  {userProfile?.role}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {userProfile?.address || "No address"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since{" "}
                  {formatVietnameseDate(userProfile?.createdAt || "")}
                </span>
                {/* <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  4.9 avg rating
                </span> */}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-border text-foreground hover:bg-muted gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats row */}
          {/* <div className="grid grid-cols-4 gap-4 py-5 border-t border-border">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold  text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div> */}
        </div>
      </section>
    </>
  );
}
