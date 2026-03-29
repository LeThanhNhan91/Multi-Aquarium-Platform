using System;
using Aquarium.Domain.Common;

namespace Aquarium.Domain.Entities
{
    public class ProductAttribute : BaseEntity
    {
        public Guid ProductId { get; set; }
        public string AttributeKey { get; set; }   // "WaterType", "Temperament", "MinTemp", "MaxTemp"
        public string AttributeValue { get; set; }  // "Freshwater", "Aggressive", "25", "28"

        public virtual Product Product { get; set; }
    }
}
