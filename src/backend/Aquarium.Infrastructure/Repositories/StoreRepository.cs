using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Store;
using Aquarium.Application.Interfaces;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class StoreRepository : IStoreRepository
    {
        private readonly MultiStoreAquariumDBContext _context;
        public StoreRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Store store)
        {
            await _context.Stores.AddAsync(store);
        }

        public async Task AddStoreUserAsync(StoreUser storeUser)
        {
            await _context.StoreUsers.AddAsync(storeUser);
        }

        public async Task<bool> ExistsBySlugAsync(string slug)
        {
            return await _context.Stores.AnyAsync(s => s.Slug == slug);
        }

        public async Task<Store?> GetByIdAsync(Guid storeId)
        {
            return await _context.Stores.FirstOrDefaultAsync(s => s.Id == storeId);
        }

        public async Task<Dictionary<Guid, string>> GetUserRolesInStoresAsync(Guid userId, List<Guid> storeIds)
        {
            if (storeIds == null || !storeIds.Any())
            {
                return new Dictionary<Guid, string>();
            }

            return await _context.StoreUsers
                .Where(su => su.UserId == userId && storeIds.Contains(su.StoreId))
                .ToDictionaryAsync(su => su.StoreId, su => su.Role);
        }

        public async Task<List<Store>> GetStoresByFilterAsync(GetStoresFilter filter)
        {
            var query = _context.Stores.AsQueryable();

            if (filter.StoreId.HasValue)
            {
                query = query.Where(s => s.Id == filter.StoreId.Value);
            }

            if (filter.UserId.HasValue)
            {
                query = query.Where(s => s.StoreUsers.Any(su => su.UserId == filter.UserId.Value));
            }

            if (!string.IsNullOrEmpty(filter.Slug))
            {
                query = query.Where(s => s.Slug == filter.Slug);
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(s => s.Status == filter.Status);
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(s => s.Name.Contains(filter.SearchTerm) ||
                                         (s.Description != null && s.Description.Contains(filter.SearchTerm)));
            }

            return await query.ToListAsync();
        }

        public async Task<List<StoreUser>> GetMembersAsync(Guid storeId)
        {
            return await _context.StoreUsers
                .Include(su => su.User)
                .Where(su => su.StoreId == storeId)
                .ToListAsync();
        }

        public async Task<StoreUser?> GetStoreUserAsync(Guid storeId, Guid userId)
        {
            return await _context.StoreUsers
        .FirstOrDefaultAsync(su => su.StoreId == storeId && su.UserId == userId);
        }

        public async Task<bool> IsUserInStoreAsync(Guid storeId, Guid userId)
        {
            return await _context.StoreUsers.AnyAsync(su => su.StoreId == storeId && su.UserId == userId);
        }

        public async Task RemoveMemberAsync(StoreUser storeUser)
        {
            _context.StoreUsers.Remove(storeUser);
            await Task.CompletedTask;
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
