using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces.Orders;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;

namespace Aquarium.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public OrderRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
