using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Aquarium.Application.DTOs.Orders
{
    public class CreateOrderItemRequest
    {
        public Guid ProductId { get; set; }

        [Range(1, 100, ErrorMessage = "The quantity must be between 1 and 100.")]
        public int Quantity { get; set; }
    }

    public class CreateOrderRequest
    {
        [Required]
        public Guid StoreId { get; set; } 

        [Required]
        public List<CreateOrderItemRequest> Items { get; set; } = new();

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        public string? Note { get; set; }
    }
}
