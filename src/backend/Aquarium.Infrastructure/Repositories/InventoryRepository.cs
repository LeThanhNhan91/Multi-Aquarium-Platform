using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces.Inventory;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public InventoryRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Inventory inventory)
        {
            await _context.Inventories.AddAsync(inventory);
        }

        public async Task<Inventory?> GetByProductIdAsync(Guid productId)
        {
            return await _context.Inventories.FirstOrDefaultAsync(i => i.ProductId == productId);
        }

        public async Task UpdateAsync(Inventory inventory)
        {
            _context.Inventories.Update(inventory);
            await Task.CompletedTask;
        }

        public async Task AddHistoryAsync(InventoryHistory history)
        {
            await _context.InventoryHistories.AddAsync(history);
        }

        public async Task<List<InventoryHistory>> GetHistoryByProductIdAsync(Guid productId)
        {
            return await _context.InventoryHistories
                .Include(h => h.Inventory)
                .Where(h => h.Inventory.ProductId == productId)
                .OrderByDescending(h => h.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            try
            {
                return await _context.SaveChangesAsync() > 0;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                throw new ConcurrencyDomainException("The data was altered by someone else while you were working on it.", ex);
            }
        }
    }
}
