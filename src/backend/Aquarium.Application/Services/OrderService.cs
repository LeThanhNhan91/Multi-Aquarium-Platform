using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Orders;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Orders;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IProductRepository _productRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IStoreRepository _storeRepository;

        public OrderService(
            IProductRepository productRepository,
            IOrderRepository orderRepository,
            IStoreRepository storeRepository)
        {
            _productRepository = productRepository;
            _orderRepository = orderRepository;
            _storeRepository = storeRepository;
        }

        public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, Guid customerId)
        {
            // Get list of product IDs from request
            var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();

            // Fetch products from DB (Optimized query)
            var products = await _productRepository.GetByIdsAsync(productIds);

            // Check if all requested products exist
            if (products.Count != productIds.Count)
            {
                throw new BadRequestException("Some products do not exist or are inactive.");
            }

            // SINGLE-STORE RULE CHECK
            // Verify that all products belong to the requested StoreId
            var invalidProduct = products.FirstOrDefault(p => p.StoreId != request.StoreId);
            if (invalidProduct != null)
            {
                throw new BadRequestException($"Product '{invalidProduct.Name}' does not belong to the selected store. Please create separate orders for different stores.");
            }

            // Initialize Order
            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                StoreId = request.StoreId,
                ShippingAddress = request.ShippingAddress,
                Note = request.Note,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            decimal totalAmount = 0;

            // Process Items
            foreach (var itemRequest in request.Items)
            {
                var product = products.First(p => p.Id == itemRequest.ProductId);

                // Check Inventory
                if (product.Inventory == null || !product.Inventory.CanPurchase(itemRequest.Quantity))
                {
                    throw new BadRequestException($"Product '{product.Name}' is out of stock (Available: {product.Inventory?.AvailableStock ?? 0}).");
                }

                // Create Order Item (Snapshot Data)
                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    ProductName = product.Name,           // Snapshot Name
                    PriceAtPurchase = product.BasePrice,  // Snapshot Price
                    Quantity = itemRequest.Quantity
                };

                order.OrderItems.Add(orderItem);
                totalAmount += orderItem.PriceAtPurchase * orderItem.Quantity;

                // Reserve Stock
                // Logic: Increase QuantityReserved in Inventory entity
                product.Inventory.ReserveStock(itemRequest.Quantity);
            }

            order.TotalAmount = totalAmount;

            // Save to Database
            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();

            var store = await _storeRepository.GetByIdAsync(request.StoreId);

            return new OrderResponse(
                order.Id,
                order.StoreId,
                store?.Name ?? "Unknown Store",
                order.TotalAmount,
                order.Status,
                order.ShippingAddress,
                order.CreatedAt
            );
        }
    }
}
