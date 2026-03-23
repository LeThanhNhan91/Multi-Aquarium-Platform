using System;

namespace Aquarium.Application.DTOs.Cart
{
    public class CartItemDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public Guid? FishInstanceId { get; set; }
        public string ProductName { get; set; }
        public string ProductType { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string ImageUrl { get; set; }
        public Guid StoreId { get; set; }
        public string StoreName { get; set; }
        public int? AvailableStock { get; set; }
    }

    public class AddToCartDto
    {
        public Guid ProductId { get; set; }
        public Guid? FishInstanceId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
    }
}
