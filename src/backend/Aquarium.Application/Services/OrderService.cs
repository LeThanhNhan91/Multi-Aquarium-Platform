using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Orders;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Orders;
using Aquarium.Application.Interfaces.Payments;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Domain.Constants;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Aquarium.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IProductRepository _productRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IStoreRepository _storeRepository;
        private readonly ILogger<OrderService> _logger;
        private readonly IPaymentGateway _paymentGateway;

        public OrderService(
            IProductRepository productRepository,
            IOrderRepository orderRepository,
            IStoreRepository storeRepository,
            IPaymentGateway paymentGateway,
            ILogger<OrderService> logger)
        {
            _productRepository = productRepository;
            _orderRepository = orderRepository;
            _storeRepository = storeRepository;
            _paymentGateway = paymentGateway;
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

        public async Task<string> CreatePaymentUrlAsync(Guid orderId, Guid userId, HttpContext httpContext)
        {
            var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
            if (order == null) throw new NotFoundException("Order", orderId);

            if (order.CustomerId != userId)
                throw new ForbiddenException("Not allowed to pay for this order.");

            if (order.Status != OrderStatus.Pending)
                throw new BadRequestException("Order is not Pending.");

            // Generate VNPay URL
            return _paymentGateway.CreatePaymentUrl(order, httpContext);
        }

        public async Task<bool> HandlePaymentCallbackAsync(IQueryCollection collections)
        {
            var result = _paymentGateway.ProcessPaymentReturn(collections);

            if (!result.IsSuccess)
            {
                _logger.LogWarning($"Payment failed: {result.Message}");
                return false;
            }

            if (string.IsNullOrEmpty(result.OrderId)) return false;

            // Parse OrderID (Ensure it's a GUID)
            if (!Guid.TryParse(result.OrderId, out var orderId))
            {
                _logger.LogError("Invalid Order Id from VNPay.");
                return false;
            }

            var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
            if (order == null)
            {
                _logger.LogError($"Order {orderId} not found during payment callback.");
                return false;
            }

            // Check if already paid to avoid double update
            if (order.PaymentStatus == PaymentsStatus.Paid)
            {
                _logger.LogInformation($"Order {order.Id} is already paid. Skipping update.");
                return true;
            }

            // Update Order
            order.PaymentStatus = PaymentsStatus.Paid;
            order.PaymentMethod = "VNPay";
            order.TransactionId = result.TransactionId;
            order.PaidAt = DateTime.UtcNow;

            // Update Order Lifecycle Status
            // Logic: If customer paid successfully, we auto-confirm the order
            if (order.Status == OrderStatus.Pending)
            {
                order.Status = OrderStatus.Confirmed;
            }

            await _orderRepository.SaveChangesAsync();
            _logger.LogInformation($"Order {order.Id} payment processed successfully via VNPay.");

            return true;
        }

        public async Task CancelOrderAsync(Guid orderId, Guid userId, string reason)
        {
            using var transaction = await _orderRepository.BeginTransactionAsync();
            try
            {
                var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
                if (order == null) throw new NotFoundException("Order", orderId);

                // Security & State Check
                // Allow Customer to cancel if Pending
                // Allow Store Owner to cancel if Pending or Paid (Refund scenario - not covered here yet)

                bool isOwner = order.CustomerId == userId;
                bool isStoreOwner = false;

                var storeUser = await _storeRepository.GetStoreUserAsync(order.StoreId, userId);

                if (storeUser != null && (storeUser.Role == "Owner" || storeUser.Role == "Manager"))
                {
                    isStoreOwner = true;
                }

                if (!isOwner && !isStoreOwner)
                    throw new ForbiddenException("Not authorized to cancel this order.");

                if (order.Status == OrderStatus.Completed || order.Status == OrderStatus.Cancelled)
                    throw new BadRequestException("Cannot cancel an order that is already completed or cancelled.");

                // Update Order Status
                order.Status = OrderStatus.Cancelled;
                order.Note += $" | Cancelled Reason: {reason}";

                // STOCK ROLLBACK (Critical Business Logic)
                // We must return the 'Reserved' quantity back to 'Available'

                // Collect Product IDs to fetch Inventories
                var productIds = order.OrderItems.Select(i => i.ProductId).ToList();
                var products = await _productRepository.GetByIdsAsync(productIds);

                foreach (var item in order.OrderItems)
                {
                    var product = products.First(p => p.Id == item.ProductId);

                    if (product.Inventory != null)
                    {
                        // Call the Domain Logic we added in Step 4
                        product.Inventory.ReleaseStock(item.Quantity);
                    }
                }

                await _orderRepository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation($"Order {orderId} cancelled. Stock released.");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
