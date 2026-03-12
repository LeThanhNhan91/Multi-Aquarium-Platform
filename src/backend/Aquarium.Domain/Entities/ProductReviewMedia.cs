#nullable disable
using System;

namespace Aquarium.Domain.Entities;

public class ProductReviewMedia
{
    public Guid Id { get; set; }

    public Guid ProductReviewId { get; set; }

    public string MediaUrl { get; set; }

    public string? PublicId { get; set; }

    public int DisplayOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ProductReview ProductReview { get; set; }
}
