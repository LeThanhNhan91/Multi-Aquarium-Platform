using System;
using System.Collections.Generic;

namespace Aquarium.Domain.Constants
{
    public static class BadgeType
    {
        public const string TrustedSeller = "TrustedSeller";
        public const string TopRated = "TopRated";
    }

    public static class BadgeCriteria
    {
        // (MinAverageRating, MinTotalReviews, BadgeType, DisplayName, Description)
        public static readonly IReadOnlyList<(double MinRating, int MinReviews, string Type, string DisplayName, string Description)> All =
            new List<(double, int, string, string, string)>
            {
                (4.5, 50,  BadgeType.TrustedSeller, "Trusted Seller",  "Store with average rating ≥ 4.5 and at least 50 reviews"),
                (4.8, 100, BadgeType.TopRated,      "Top Rated",       "Store with average rating ≥ 4.8 and at least 100 reviews"),
            };
    }
}
