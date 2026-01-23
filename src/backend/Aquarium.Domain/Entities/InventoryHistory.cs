using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Domain.Entities
{
    public class InventoryHistory
    {
        public Guid Id { get; set; }

        public Guid InventoryId { get; set; }

        public virtual Inventory Inventory { get; set; }

        public string ActionType { get; set; } = string.Empty;

        public int QuantityChange { get; set; }

        public int RemainingQuantity { get; set; }

        public string? Note { get; set; }

        public Guid CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
