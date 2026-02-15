import { Star } from "lucide-react";

type StarRatingProps = {
  averageRating: number;
  size?: number;
};

const StarRating = ({ averageRating, size = 20 }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage =
          Math.min(Math.max(averageRating - (star - 1), 0), 1) * 100;

        return (
          <div
            key={star}
            className="relative"
            style={{ width: size, height: size }}
          >
            <Star size={size} className="absolute text-gray-300" />

            <div
              className="absolute overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star size={size} className="text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
