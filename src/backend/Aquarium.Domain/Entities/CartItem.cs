using System;
using System.Collections.Generic;
using Aquarium.Domain.Common;

namespace Aquarium.Domain.Entities
{
    public partial class CartItem : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? FishInstanceId { get; set; }
        public int Quantity { get; set; }

        public virtual User User { get; set; }
        public virtual Product Product { get; set; }
        public virtual FishInstance FishInstance { get; set; }
    }
}
