#nullable disable
using System;
using System.Collections.Generic;

namespace Aquarium.Domain.Entities;

public class DoaRequest
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public Guid CustomerId { get; set; }

    public string Reason { get; set; }

    public string Status { get; set; } = "Pending";

    public string ReviewNote { get; set; }

    public Guid? ReviewedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public virtual Order Order { get; set; }

    public virtual User Customer { get; set; }

    public virtual User ReviewedByUser { get; set; }

    public virtual ICollection<DoaRequestMedia> Media { get; set; } = new List<DoaRequestMedia>();
}
