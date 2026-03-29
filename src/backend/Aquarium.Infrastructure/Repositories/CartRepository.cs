using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Application.Interfaces.Cart;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public CartRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CartItem>> GetByUserIdAsync(Guid userId)
        {
            return await _context.CartItems
                .Include(c => c.Product)
                    .ThenInclude(p => p.Store)
                .Include(c => c.Product)
                    .ThenInclude(p => p.ProductMedia)
                .Include(c => c.Product)
                    .ThenInclude(p => p.Attributes)
                .Include(c => c.FishInstance)
                    .ThenInclude(f => f.FishInstanceMedia)
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }

        public async Task<CartItem> GetByIdAsync(Guid id)
        {
            return await _context.CartItems
                .Include(c => c.Product)
                    .ThenInclude(p => p.Store)
                .Include(c => c.Product)
                    .ThenInclude(p => p.ProductMedia)
                .Include(c => c.Product)
                    .ThenInclude(p => p.Attributes)
                .Include(c => c.FishInstance)
                    .ThenInclude(f => f.FishInstanceMedia)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<CartItem> GetByProductAsync(Guid userId, Guid productId, Guid? fishInstanceId)
        {
            return await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && 
                                         c.ProductId == productId && 
                                         c.FishInstanceId == fishInstanceId);
        }

        public async Task AddAsync(CartItem item)
        {
            await _context.CartItems.AddAsync(item);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CartItem item)
        {
            _context.CartItems.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(CartItem item)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }

        public async Task ClearAsync(Guid userId)
        {
            var items = await _context.CartItems.Where(c => c.UserId == userId).ToListAsync();
            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteByStoreAsync(Guid userId, Guid storeId)
        {
            var items = await _context.CartItems
                .Include(c => c.Product)
                .Where(c => c.UserId == userId && c.Product.StoreId == storeId)
                .ToListAsync();
            
            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }
    }
}
