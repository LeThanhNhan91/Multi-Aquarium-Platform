#nullable disable
using System;

namespace Aquarium.Domain.Entities;

public class DoaRequestMedia
{
    public Guid Id { get; set; }

    public Guid DoaRequestId { get; set; }

    public string MediaUrl { get; set; }

    public string MediaType { get; set; }

    public string PublicId { get; set; }

    public int DisplayOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; }

    public virtual DoaRequest DoaRequest { get; set; }
}
