using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Aquarium.Application.DTOs.Orders
{
    public class ValidateCheckoutRequest
    {
        [Required]
        public Guid StoreId { get; set; }

        [Required]
        public List<CreateOrderItemRequest> Items { get; set; } = new();
    }

    public class CheckoutValidationResult
    {
        public bool IsValid { get; set; }
        public List<InventoryCheckItem> Items { get; set; } = new();
        public string? Message { get; set; }
    }

    public class InventoryCheckItem
    {
        public Guid ProductId { get; set; }
        public Guid? FishInstanceId { get; set; }
        public string ProductName { get; set; }
        public int RequestedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public bool IsAvailable { get; set; }
        public string? Reason { get; set; }
    }
}
