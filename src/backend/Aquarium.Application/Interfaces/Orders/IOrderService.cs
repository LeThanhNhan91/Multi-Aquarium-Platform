using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Orders;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.Interfaces.Orders
{
    public interface IOrderService
    {
        Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, Guid customerId);

        Task<OrderDetailResponse> GetOrderByIdAsync(Guid orderId, Guid userId);

        Task<PagedResult<OrderResponse>> GetOrdersAsync(GetOrdersFilter filter, Guid userId);

        Task<string> CreatePaymentUrlAsync(Guid orderId, Guid userId, HttpContext httpContext);

        Task<bool> HandlePaymentCallbackAsync(IQueryCollection collections);

        Task CancelOrderAsync(Guid orderId, Guid userId, string reason);
        
        Task UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequest request, Guid userId);
    }
}
