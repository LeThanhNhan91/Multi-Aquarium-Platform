"use client";

import { Shield, Trophy, Award } from "lucide-react";
import { useGetStoreBadgesQuery } from "@/services/reviewApi";
import type { StoreBadgeResponse } from "@/types/review.type";

const BADGE_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; className: string }
> = {
  TrustedSeller: {
    icon: <Shield className="h-3.5 w-3.5" />,
    label: "Người bán uy tín",
    className:
      "bg-blue-500/10 border-blue-500/30 text-blue-600",
  },
  TopRated: {
    icon: <Trophy className="h-3.5 w-3.5" />,
    label: "Đánh giá cao",
    className:
      "bg-amber-500/10 border-amber-500/30 text-amber-600",
  },
};

function BadgePill({ badge }: { badge: StoreBadgeResponse }) {
  const config = BADGE_CONFIG[badge.badgeType];
  if (!config) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold bg-muted/40 border-border/50 text-muted-foreground">
        <Award className="h-3.5 w-3.5" />
        {badge.displayName}
      </div>
    );
  }
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config.className}`}
      title={badge.description}
    >
      {config.icon}
      {config.label}
    </div>
  );
}

interface StoreBadgesProps {
  storeId: string;
}

export function StoreBadges({ storeId }: StoreBadgesProps) {
  const { data } = useGetStoreBadgesQuery(storeId);
  const badges = data?.data ?? [];

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <BadgePill key={badge.badgeType} badge={badge} />
      ))}
    </div>
  );
}
