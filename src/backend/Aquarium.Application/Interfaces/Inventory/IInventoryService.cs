using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Inventory;

namespace Aquarium.Application.Interfaces.Inventory
{
    public interface IInventoryService
    {
        Task<InventoryResponse> GetStockAsync(Guid productId);
        Task UpdateStockAsync(Guid productId, UpdateStockRequest request, Guid userId);
        Task InitInventoryAsync(Guid productId); // Automatically create inventory when creating a product.
        Task<List<InventoryHistoryResponse>> GetHistoryAsync(Guid productId, Guid userId);
    }
}
