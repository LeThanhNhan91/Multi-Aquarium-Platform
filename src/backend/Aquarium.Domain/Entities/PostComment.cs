using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Domain.Entities
{
    public class PostComment
    {
        public Guid Id { get; set; }

        public Guid PostId { get; set; }
        public virtual StorePost Post { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
