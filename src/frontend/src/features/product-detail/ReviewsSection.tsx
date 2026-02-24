import { Star, MessageCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/utils/utils";

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
}

interface ReviewsSectionProps {
  averageRating: number;
  totalReviews: number;
}

const mockReviews: ReviewItem[] = [
  {
    id: "1",
    author: "Nguyễn Văn A",
    rating: 5,
    title: "Sản phẩm tuyệt vời!",
    content:
      "Cá rất khỏe mạnh, giao hàng nhanh chóng. Rất hài lòng với chất lượng sản phẩm.",
    date: "2024-02-20",
    helpful: 45,
  },
  {
    id: "2",
    author: "Trần Thị B",
    rating: 4,
    title: "Tốt nhưng có thể tốt hơn",
    content:
      "Sản phẩm chất lượng, nhưng đóng gói có thể cẩn thận hơn một chút.",
    date: "2024-02-15",
    helpful: 12,
  },
];

const ratingDistribution = [
  { rating: 5, count: 1842, percentage: 65 },
  { rating: 4, count: 580, percentage: 21 },
  { rating: 3, count: 180, percentage: 8 },
  { rating: 2, count: 50, percentage: 3 },
  { rating: 1, count: 30, percentage: 1 },
];

export function ReviewsSection({
  averageRating,
  totalReviews,
}: ReviewsSectionProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold font-serif text-foreground">
        Đánh giá & Nhận xét
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
                Dựa trên {totalReviews} đánh giá
              </p>
            </div>

            <Separator className="bg-border/50" />

            {/* Rating Distribution */}
            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline whitespace-nowrap">
                    {item.rating} <Star className="h-3 w-3 fill-amber-400" />
                  </button>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-accent"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold">
              Viết đánh giá
            </Button>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-4">
          {mockReviews.map((review) => (
            <Card
              key={review.id}
              className="border-border/50 bg-card rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {review.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {review.author}
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
                        {new Date(review.date).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Title and Content */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">
                  {review.title}
                </h4>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {review.content}
                </p>
              </div>

              {/* Review Footer */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  Hữu ích ({review.helpful})
                </button>
                <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  Trả lời
                </button>
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/5 rounded-lg font-semibold py-3"
          >
            Xem thêm đánh giá
          </Button>
        </div>
      </div>
    </div>
  );
}
