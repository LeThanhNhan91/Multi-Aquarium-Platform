using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Aquarium.Application.DTOs.Reviews
{
    public class CreateReviewRequest
    {
        [Required]
        public Guid OrderId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "Comment must be between 10 and 1000 characters")]
        public string Comment { get; set; }

        public List<string>? MediaUrls { get; set; }
    }

    public class UpdateReviewRequest
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "Comment must be between 10 and 1000 characters")]
        public string Comment { get; set; }
    }

    public class ReviewResponse
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public Guid? StoreId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string UserAvatarUrl { get; set; }
        public Guid OrderId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<string> MediaUrls { get; set; } = new();
    }

    public class StoreBadgeResponse
    {
        public string BadgeType { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public DateTime AwardedAt { get; set; }
    }

    public class ReviewSummary
    {
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int FiveStarCount { get; set; }
        public int FourStarCount { get; set; }
        public int ThreeStarCount { get; set; }
        public int TwoStarCount { get; set; }
        public int OneStarCount { get; set; }
    }

    public class GetReviewsFilter
    {
        public int? Rating { get; set; }
        public string? SortBy { get; set; } = "CreatedAt";
        public bool IsDescending { get; set; } = true;
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class CanReviewResponse
    {
        public bool CanReview { get; set; }
        public Guid? OrderId { get; set; }
        public string Message { get; set; }
    }
}
