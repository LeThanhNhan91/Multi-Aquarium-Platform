using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Orders;

namespace Aquarium.Application.Interfaces.Orders
{
    public interface IOrderService
    {
        Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, Guid customerId);
    }
}
