"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, MessageCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/utils";
import {
  useGetStoreReviewsQuery,
  useGetStoreReviewSummaryQuery,
} from "@/services/reviewApi";

interface StoreReviewsSectionProps {
  storeId: string;
}

export function StoreReviewsSection({ storeId }: StoreReviewsSectionProps) {
  const [pageIndex, setPageIndex] = useState(1);

  const { data: reviewsResponse, isFetching: isReviewsLoading } =
    useGetStoreReviewsQuery({
      storeId,
      filter: {
        pageIndex,
        pageSize: 5,
        sortBy: "CreatedAt",
        isDescending: true,
      },
    });

  const { data: summaryResponse } = useGetStoreReviewSummaryQuery(storeId);

  const summary = summaryResponse?.data;
  const reviews = reviewsResponse?.data?.items ?? [];
  const totalCount = reviewsResponse?.data?.totalCount ?? 0;
  const averageRating = summary?.averageRating ?? 0;

  const ratingDistribution = [
    {
      rating: 5,
      count: summary?.fiveStarCount ?? 0,
      percentage: summary?.totalReviews
        ? (summary.fiveStarCount / summary.totalReviews) * 100
        : 0,
    },
    {
      rating: 4,
      count: summary?.fourStarCount ?? 0,
      percentage: summary?.totalReviews
        ? (summary.fourStarCount / summary.totalReviews) * 100
        : 0,
    },
    {
      rating: 3,
      count: summary?.threeStarCount ?? 0,
      percentage: summary?.totalReviews
        ? (summary.threeStarCount / summary.totalReviews) * 100
        : 0,
    },
    {
      rating: 2,
      count: summary?.twoStarCount ?? 0,
      percentage: summary?.totalReviews
        ? (summary.twoStarCount / summary.totalReviews) * 100
        : 0,
    },
    {
      rating: 1,
      count: summary?.oneStarCount ?? 0,
      percentage: summary?.totalReviews
        ? (summary.oneStarCount / summary.totalReviews) * 100
        : 0,
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">
        Đánh giá cửa hàng
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Rating Summary */}
        <div className="md:col-span-1">
          <Card className="border-border/50 bg-linear-to-br from-card to-card/80 rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mt-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted",
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Dựa trên {totalCount} đánh giá
              </p>
            </div>

            <Separator className="bg-border/50" />

            {/* Rating Distribution */}
            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground whitespace-nowrap min-w-7.5">
                    {item.rating}{" "}
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-accent"
                      style={{ width: `${item.percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap min-w-7.5">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-4">
          {reviews.length === 0 && !isReviewsLoading && (
            <div className="text-center py-12 text-muted-foreground">
              Chưa có đánh giá nào cho cửa hàng này.
            </div>
          )}

          {reviews.map((review) => (
            <Card
              key={review.id}
              className="border-border/50 bg-card rounded-2xl p-6 space-y-2 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={review.userAvatarUrl || ""}
                      alt={review.userName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {review.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {review.userName}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted",
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-2">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {review.comment}
                </p>

                {/* Review images */}
                {review.mediaUrls?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {review.mediaUrls.map((url, i) => (
                      <div
                        key={i}
                        className="relative h-20 w-20 rounded-lg overflow-hidden border border-border/50"
                      >
                        <Image src={url} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Footer */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  Hữu ích (0)
                </button>
                <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  Trả lời
                </button>
              </div>
            </Card>
          ))}

          {totalCount > reviews.length && (
            <Button
              variant="outline"
              onClick={() => setPageIndex((p) => p + 1)}
              disabled={isReviewsLoading}
              className="w-full border-primary/30 text-primary hover:bg-primary/5 rounded-lg font-semibold py-3"
            >
              {isReviewsLoading ? "Đang tải..." : "Xem thêm đánh giá"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
