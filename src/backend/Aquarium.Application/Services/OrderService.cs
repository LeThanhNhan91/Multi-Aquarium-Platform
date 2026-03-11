using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Orders;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Categories;
using Aquarium.Application.Interfaces.FishInstances;
using Aquarium.Application.Interfaces.Orders;
using Aquarium.Application.Interfaces.Payments;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Application.Interfaces.Reviews;
using Aquarium.Application.Wrappers;
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
        private readonly IFishInstanceRepository _fishInstanceRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IReviewRepository _reviewRepository;

        public OrderService(
            IProductRepository productRepository,
            IOrderRepository orderRepository,
            IStoreRepository storeRepository,
            IPaymentGateway paymentGateway,
            IFishInstanceRepository fishInstanceRepository,
            ICategoryRepository categoryRepository,
            IReviewRepository reviewRepository,
            ILogger<OrderService> logger)
        {
            _productRepository = productRepository;
            _orderRepository = orderRepository;
            _storeRepository = storeRepository;
            _paymentGateway = paymentGateway;
            _fishInstanceRepository = fishInstanceRepository;
            _categoryRepository = categoryRepository;
            _reviewRepository = reviewRepository;
            _logger = logger;
        }

        public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, Guid customerId)
        {
            {
                // Check if this order has been processed before.
                var existingOrder = await _orderRepository.GetByIdempotencyKeyAsync(request.IdempotencyKey.Value);

                if (existingOrder != null)
                {
                    _logger.LogInformation($"Idempotency check: Order {existingOrder.Id} already exists for key {request.IdempotencyKey}.");

                    // Reload with items
                    var fullExistingOrder = await _orderRepository.GetByIdWithDetailsAsync(existingOrder.Id);
                    
                    // Return the old result immediately without creating a new order or deducting inventory again.
                    var existingStore = await _storeRepository.GetByIdAsync(existingOrder.StoreId);
                    return new OrderResponse(
                        existingOrder.Id,
                        existingOrder.StoreId,
                        existingStore?.Name ?? "Unknown Store",
                        existingOrder.CustomerId,
                        fullExistingOrder?.Customer?.FullName ?? "",
                        existingOrder.TotalAmount,
                        existingOrder.Status,
                        existingOrder.PaymentStatus,
                        existingOrder.ShippingAddress,
                        existingOrder.Note,
                        existingOrder.CreatedAt,
                        fullExistingOrder?.OrderItems.Select(i => new OrderItemResponse(
                            i.ProductId,
                            i.FishInstanceId,
                            i.ProductName,
                            i.PriceAtPurchase,
                            i.Quantity,
                            i.PriceAtPurchase * i.Quantity,
                            i.ProductImageUrl,
                            null,
                            null
                        )).ToList() ?? new List<OrderItemResponse>()
                    );
                }
            }

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
                    IdempotencyKey = request.IdempotencyKey,
                    CreatedAt = DateTime.UtcNow
                };

                decimal totalAmount = 0;

                foreach (var itemRequest in request.Items)
                {
                    var product = products.First(p => p.Id == itemRequest.ProductId);

                    // Determine if this is a LiveFish product
                    var rootCategory = await _categoryRepository.GetRootCategoryAsync(product.CategoryId);
                    string baseSlug = Helper.GetBaseSlug(rootCategory?.Slug ?? "");
                    bool isLiveFish = baseSlug == "ca-canh";

                    if (isLiveFish)
                    {
                        // === LIVE FISH LOGIC ===
                        
                        // Validate: FishInstanceId must be provided
                        if (!itemRequest.FishInstanceId.HasValue)
                        {
                            throw new BadRequestException($"Product '{product.Name}' is a LiveFish product. You must specify which fish instance to purchase.");
                        }

                        // Validate: Quantity must be 1 for LiveFish
                        if (itemRequest.Quantity != 1)
                        {
                            throw new BadRequestException($"LiveFish products can only have quantity = 1. Product: '{product.Name}'");
                        }

                        var fishInstance = await _fishInstanceRepository.GetByIdAsync(itemRequest.FishInstanceId.Value);
                        
                        if (fishInstance == null)
                        {
                            throw new NotFoundException("FishInstance", itemRequest.FishInstanceId.Value);
                        }

                        if (fishInstance.ProductId != product.Id)
                        {
                            throw new BadRequestException($"Fish instance does not belong to product '{product.Name}'");
                        }

                        if (fishInstance.Status != "Available")
                        {
                            throw new BadRequestException($"This fish is not available (Status: {fishInstance.Status})");
                        }

                        // Mark fish as Reserved (will be marked as Sold after payment)
                        fishInstance.Status = "Reserved";
                        fishInstance.ReservedUntil = DateTime.UtcNow.AddMinutes(15); // 15 min reservation
                        await _fishInstanceRepository.UpdateAsync(fishInstance);

                        // Get primary image from FishInstance
                        var fishImageUrl = fishInstance.FishInstanceMedia
                            .OrderBy(m => m.DisplayOrder)
                            .FirstOrDefault()?.MediaUrl;

                        var orderItem = new OrderItem
                        {
                            Id = Guid.NewGuid(),
                            ProductId = product.Id,
                            FishInstanceId = fishInstance.Id,
                            ProductName = $"{product.Name} - {fishInstance.Size} ({fishInstance.Color})",
                            PriceAtPurchase = fishInstance.Price,
                            Quantity = 1,
                            ProductImageUrl = fishImageUrl
                        };

                        order.OrderItems.Add(orderItem);
                        totalAmount += orderItem.PriceAtPurchase;
                    }
                    else
                    {
                        
                        // Validate: FishInstanceId should not be provided for Equipment
                        if (itemRequest.FishInstanceId.HasValue)
                        {
                            throw new BadRequestException($"Product '{product.Name}' is not a LiveFish product. Do not specify FishInstanceId.");
                        }

                        if (product.Inventory == null || !product.Inventory.CanPurchase(itemRequest.Quantity))
                        {
                            throw new BadRequestException($"Product '{product.Name}' is out of stock (Available: {product.Inventory?.AvailableStock ?? 0}).");
                        }

                        // Get primary image from Product
                        var productImageUrl = product.ProductMedia
                            .FirstOrDefault(m => m.IsPrimary == true)?.MediaUrl
                            ?? product.ProductMedia.FirstOrDefault()?.MediaUrl;

                        var orderItem = new OrderItem
                        {
                            Id = Guid.NewGuid(),
                            ProductId = product.Id,
                            FishInstanceId = null,
                            ProductName = product.Name,
                            PriceAtPurchase = product.BasePrice,
                            Quantity = itemRequest.Quantity,
                            ProductImageUrl = productImageUrl
                        };

                        order.OrderItems.Add(orderItem);
                        totalAmount += orderItem.PriceAtPurchase * orderItem.Quantity;

                        product.Inventory.ReserveStock(itemRequest.Quantity);
                    }
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
                    customerId,
                    "",
                    order.TotalAmount,
                    order.Status,
                    order.PaymentStatus,
                    order.ShippingAddress,
                    order.Note,
                    order.CreatedAt,
                    order.OrderItems.Select(i => new OrderItemResponse(
                        i.ProductId,
                        i.FishInstanceId,
                        i.ProductName,
                        i.PriceAtPurchase,
                        i.Quantity,
                        i.PriceAtPurchase * i.Quantity,
                        i.ProductImageUrl,
                        null,
                        null
                    )).ToList()
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

            var reviews = await _reviewRepository.GetProductReviewsByOrderAsync(orderId, userId);
            var reviewedProductIds = reviews.Select(r => r.ProductId).ToHashSet();

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
                order.OrderItems.Select(i =>
                {
                    var fishMedia = i.FishInstance?.FishInstanceMedia
                        .OrderBy(m => m.DisplayOrder).ToList();
                    var fishImages = fishMedia?
                        .Where(m => !string.Equals(m.MediaType, "video", StringComparison.OrdinalIgnoreCase))
                        .Select(m => m.MediaUrl).ToList();
                    var fishVideo = fishMedia?
                        .FirstOrDefault(m => string.Equals(m.MediaType, "video", StringComparison.OrdinalIgnoreCase))
                        ?.MediaUrl;
                    return new OrderItemResponse(
                        i.ProductId,
                        i.FishInstanceId,
                        i.ProductName,
                        i.PriceAtPurchase,
                        i.Quantity,
                        i.PriceAtPurchase * i.Quantity,
                        i.ProductImageUrl,
                        fishImages,
                        fishVideo,
                        reviewedProductIds.Contains(i.ProductId)
                    );
                }).ToList(),
                reviews.Any()
            );
        }

        public async Task<PagedResult<OrderResponse>> GetOrdersAsync(GetOrdersFilter filter, Guid userId)
        {
            // Get user's stores (if user is store owner/manager)
            var userStores = await _storeRepository.GetStoresByUserIdAsync(userId);
            var userStoreIds = userStores.Select(s => s.Id).ToList();

            // Filter orders that user can see:
            // 1. Orders where user is customer
            // 2. Orders from stores where user is owner/manager
            var pagedOrders = await _orderRepository.GetOrdersByFilterAsync(filter);

            // Apply security filter
            var accessibleOrders = pagedOrders.Items.Where(o =>
                o.CustomerId == userId || // User is customer
                userStoreIds.Contains(o.StoreId) // User is store owner/manager
            ).ToList();

            // Recalculate total count after security filter
            var totalAccessible = accessibleOrders.Count;

            // Fetch reviews for these orders
            var orderIds = accessibleOrders.Select(o => o.Id).ToList();
            var userReviews = await _reviewRepository.GetProductReviewsByOrderIdsAsync(orderIds, userId);
            var reviewedOrderIds = userReviews.Select(r => r.OrderId).ToHashSet();
            var reviewedOrderItemKeys = userReviews.Select(r => $"{r.OrderId}_{r.ProductId}").ToHashSet();

            var orderResponses = accessibleOrders.Select(o => new OrderResponse(
                o.Id,
                o.StoreId,
                o.Store?.Name ?? "Unknown Store",
                o.CustomerId,
                o.Customer?.FullName ?? "Unknown Customer",
                o.TotalAmount,
                o.Status,
                o.PaymentStatus,
                o.ShippingAddress,
                o.Note,
                o.CreatedAt,
                o.OrderItems.Select(i => new OrderItemResponse(
                    i.ProductId,
                    i.FishInstanceId,
                    i.ProductName,
                    i.PriceAtPurchase,
                    i.Quantity,
                    i.PriceAtPurchase * i.Quantity,
                    i.ProductImageUrl,
                    null,
                    null,
                    reviewedOrderItemKeys.Contains($"{o.Id}_{i.ProductId}")
                )).ToList(),
                reviewedOrderIds.Contains(o.Id)
            )).ToList();

            return new PagedResult<OrderResponse>(
                orderResponses,
                totalAccessible,
                filter.PageIndex,
                filter.PageSize
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

            // Mark FishInstances as Sold (if any)
            foreach (var orderItem in order.OrderItems.Where(oi => oi.FishInstanceId.HasValue))
            {
                var fishInstance = await _fishInstanceRepository.GetByIdAsync(orderItem.FishInstanceId.Value);
                if (fishInstance != null && fishInstance.Status == "Reserved")
                {
                    fishInstance.Status = "Sold";
                    fishInstance.SoldAt = DateTime.UtcNow;
                    fishInstance.ReservedUntil = null;
                    await _fishInstanceRepository.UpdateAsync(fishInstance);
                }
            }

            await _orderRepository.SaveChangesAsync();
            await _fishInstanceRepository.SaveChangesAsync();
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
                    if (item.FishInstanceId.HasValue)
                    {
                        // === LIVE FISH: Release reservation ===
                        var fishInstance = await _fishInstanceRepository.GetByIdAsync(item.FishInstanceId.Value);
                        if (fishInstance != null && (fishInstance.Status == "Reserved" || fishInstance.Status == "Sold"))
                        {
                            fishInstance.Status = "Available";
                            fishInstance.ReservedUntil = null;
                            fishInstance.SoldAt = null;
                            await _fishInstanceRepository.UpdateAsync(fishInstance);
                        }
                    }
                    else
                    {
                        // === EQUIPMENT: Release inventory ===
                        var product = products.First(p => p.Id == item.ProductId);

                        if (product.Inventory != null)
                        {
                            // Call the Domain Logic we added in Step 4
                            product.Inventory.ReleaseStock(item.Quantity);
                        }
                    }
                }

                await _orderRepository.SaveChangesAsync();
                await _fishInstanceRepository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation($"Order {orderId} cancelled. Stock released.");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequest request, Guid userId)
        {
            var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
            if (order == null) throw new NotFoundException("Order", orderId);

            // Security Check
            var storeUser = await _storeRepository.GetStoreUserAsync(order.StoreId, userId);
            if (storeUser == null || (storeUser.Role != "Owner" && storeUser.Role != "Manager"))
            {
                throw new ForbiddenException("Only store owners or managers can update order status.");
            }

            // Status Transition Logic
            var statusOrder = new List<string> 
            { 
                OrderStatus.Pending, 
                OrderStatus.Confirmed, 
                OrderStatus.Processing, 
                OrderStatus.Shipping, 
                OrderStatus.Completed 
            };

            int currentIndex = statusOrder.IndexOf(order.Status);
            int newIndex = statusOrder.IndexOf(request.Status);

            // Special handling for Cancellation
            if (request.Status == OrderStatus.Cancelled)
            {
                // Can only cancel if not already Shipping or Completed
                if (currentIndex >= statusOrder.IndexOf(OrderStatus.Shipping))
                {
                    throw new BadRequestException($"Cannot cancel an order that is already {order.Status}.");
                }
                await CancelOrderAsync(orderId, userId, "Cancelled by Store: " + request.Note);
                return;
            }

            // Normal transition: Must move forward
            if (newIndex <= currentIndex)
            {
                throw new BadRequestException($"Cannot move order status backwards from {order.Status} to {request.Status}.");
            }

            order.Status = request.Status;
            if (!string.IsNullOrEmpty(request.Note))
            {
                order.Note += $" | Update: {request.Note}";
            }

            await _orderRepository.SaveChangesAsync();
            _logger.LogInformation($"Order {orderId} status updated to {request.Status} by user {userId}.");
        }
    }
}
