using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Orders
{
    public interface IOrderRepository
    {
        Task AddAsync(Order order);
        Task<bool> SaveChangesAsync();
    }
}
