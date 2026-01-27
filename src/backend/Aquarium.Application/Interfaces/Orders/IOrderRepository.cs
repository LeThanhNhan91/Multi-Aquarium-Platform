using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Orders
{
    public interface IOrderRepository
    {
        Task AddAsync(Order order);
        Task<Order?> GetByIdWithDetailsAsync(Guid id);
        Task<IDatabaseTransaction> BeginTransactionAsync();
        Task<bool> SaveChangesAsync();
    }
}
