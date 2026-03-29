using System;
using System.Collections.Generic;

namespace Aquarium.Application.DTOs.Cart
{
    public class CompatibilityWarningDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public Guid ConflictWithProductId { get; set; }
        public string ConflictWithProductName { get; set; }
        public string WarningType { get; set; }   // "WaterType", "Temperament", "Temperature"
        public string Message { get; set; }
    }

    public class AddToCartResponseDto
    {
        public CartItemDto CartItem { get; set; }
        public List<CompatibilityWarningDto> Warnings { get; set; } = new();
    }
}
