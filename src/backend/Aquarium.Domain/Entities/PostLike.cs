using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Domain.Entities
{
    public class PostLike
    {
        public Guid PostId { get; set; }
        public virtual StorePost Post { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
