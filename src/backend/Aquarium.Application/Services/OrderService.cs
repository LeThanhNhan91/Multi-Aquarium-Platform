using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Orders;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Orders;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Aquarium.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IProductRepository _productRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IStoreRepository _storeRepository;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            IProductRepository productRepository,
            IOrderRepository orderRepository,
            IStoreRepository storeRepository,
            ILogger<OrderService> logger)
        {
            _productRepository = productRepository;
            _orderRepository = orderRepository;
            _storeRepository = storeRepository;
            _logger = logger;
        }

        public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, Guid customerId)
        {
            // This ensures that if Inventory update fails, the Order is not created, and vice versa.
            using var transaction = await _orderRepository.BeginTransactionAsync();

            try
            {
                var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
                var products = await _productRepository.GetByIdsAsync(productIds);

                if (products.Count != productIds.Count)
                    throw new BadRequestException("Some products do not exist or are inactive.");

                var invalidProduct = products.FirstOrDefault(p => p.StoreId != request.StoreId);
                if (invalidProduct != null)
                    throw new BadRequestException($"Product '{invalidProduct.Name}' does not belong to the selected store.");

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

                foreach (var itemRequest in request.Items)
                {
                    var product = products.First(p => p.Id == itemRequest.ProductId);

                    if (product.Inventory == null || !product.Inventory.CanPurchase(itemRequest.Quantity))
                    {
                        throw new BadRequestException($"Product '{product.Name}' is out of stock (Available: {product.Inventory?.AvailableStock ?? 0}).");
                    }

                    var orderItem = new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        ProductName = product.Name,
                        PriceAtPurchase = product.BasePrice,
                        Quantity = itemRequest.Quantity
                    };

                    order.OrderItems.Add(orderItem);
                    totalAmount += orderItem.PriceAtPurchase * orderItem.Quantity;

                    // Reserve Stock
                    product.Inventory.ReserveStock(itemRequest.Quantity);
                }

                order.TotalAmount = totalAmount;

                await _orderRepository.AddAsync(order);
                await _orderRepository.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation($"Order {order.Id} created successfully for User {customerId}.");

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
            catch (Exception ex)
            {
                // Rollback on Error
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating order. Transaction rolled back.");
                throw; // Re-throw to be handled by Global Exception Handler
            }
        }

        public async Task<OrderDetailResponse> GetOrderByIdAsync(Guid orderId, Guid userId)
        {
            var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);

            if (order == null)
                throw new NotFoundException("Order", orderId);

            // Security Check: Only the Owner (Customer) or the Store Owner can view this order
            bool isCustomer = order.CustomerId == userId;

            bool isStoreOwner = false;

            var storeUser = await _storeRepository.GetStoreUserAsync(order.StoreId, userId);
            if (storeUser != null && (storeUser.Role == "Owner" || storeUser.Role == "Manager"))
            {
                isStoreOwner = true;
            }

            // Only allow if either Buyer OR Seller
            if (!isCustomer && !isStoreOwner)
            {
                throw new ForbiddenException("You are not allowed to view this order.");
            }

            return new OrderDetailResponse(
                order.Id,
                order.StoreId,
                order.Store?.Name ?? "Unknown Store",
                order.Customer?.FullName ?? "Unknown Customer",
                order.TotalAmount,
                order.Status,
                order.ShippingAddress,
                order.Note,
                order.CreatedAt,
                order.OrderItems.Select(i => new OrderItemResponse(
                    i.ProductId,
                    i.ProductName,
                    i.PriceAtPurchase,
                    i.Quantity,
                    i.PriceAtPurchase * i.Quantity
                )).ToList()
            );
        }
    }
}
