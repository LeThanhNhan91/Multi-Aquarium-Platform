using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Cart
{
    public interface ICartRepository
    {
        Task<IEnumerable<CartItem>> GetByUserIdAsync(Guid userId);
        Task<CartItem> GetByIdAsync(Guid id);
        Task<CartItem> GetByProductAsync(Guid userId, Guid productId, Guid? fishInstanceId);
        Task AddAsync(CartItem item);
        Task UpdateAsync(CartItem item);
        Task DeleteAsync(CartItem item);
        Task ClearAsync(Guid userId);
        Task DeleteByStoreAsync(Guid userId, Guid storeId);
    }
}
