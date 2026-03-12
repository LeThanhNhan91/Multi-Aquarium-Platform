#nullable disable
using System;

namespace Aquarium.Domain.Entities;

public class StoreBadge
{
    public Guid Id { get; set; }

    public Guid StoreId { get; set; }

    /// <summary>Badge type key, e.g. "TrustedSeller", "TopRated".</summary>
    public string BadgeType { get; set; }

    public DateTime AwardedAt { get; set; } = DateTime.UtcNow;

    public virtual Store Store { get; set; }
}
