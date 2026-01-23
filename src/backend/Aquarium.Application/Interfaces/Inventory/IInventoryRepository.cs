using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Domain.Entities;
using InventoryEntity = Aquarium.Domain.Entities.Inventory;

namespace Aquarium.Application.Interfaces.Inventory
{
    public interface IInventoryRepository
    {
        Task<InventoryEntity?> GetByProductIdAsync(Guid productId);
        Task AddAsync(InventoryEntity inventory);
        Task UpdateAsync(InventoryEntity inventory);
        Task AddHistoryAsync(InventoryHistory history);
        Task<List<InventoryHistory>> GetHistoryByProductIdAsync(Guid productId);
        Task<bool> SaveChangesAsync();
    }
}
