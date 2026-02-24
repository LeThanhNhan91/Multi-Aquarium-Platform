using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Orders;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Orders
{
    public interface IOrderRepository
    {
        Task AddAsync(Order order);
        Task<Order?> GetByIdWithDetailsAsync(Guid id);
        Task<PagedResult<Order>> GetOrdersByFilterAsync(GetOrdersFilter filter);
        Task<IDatabaseTransaction> BeginTransactionAsync();
        Task<Order?> GetByIdempotencyKeyAsync(Guid idempotencyKey);
        Task<bool> SaveChangesAsync();
    }
}
