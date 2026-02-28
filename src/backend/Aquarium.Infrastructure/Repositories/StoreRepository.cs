using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Stores;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Wrappers;
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

        public async Task UpdateAsync(Aquarium.Domain.Entities.Store store)
        {
            _context.Stores.Update(store);
            await Task.CompletedTask;
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
            return await _context.Stores
                .Include(s => s.StoreReviews.Where(r => r.Status == "Active"))
                .FirstOrDefaultAsync(s => s.Id == storeId);
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

        public async Task<PagedResult<Store>> GetStoresByFilterAsync(GetStoresFilter filter)
        {
            var query = _context.Stores
                .Include(s => s.StoreReviews.Where(r => r.Status == "Active"))
                .AsQueryable();

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

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Store>(items, totalCount, filter.PageIndex, filter.PageSize);
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

        public async Task<Guid?> GetStoreIdByUserIdAsync(Guid userId)
        {
            var storeUser = await _context.StoreUsers
                .FirstOrDefaultAsync(x => x.UserId == userId);

            return storeUser?.StoreId;
        }

        public async Task<List<Guid>> GetStoreStaffIdsAsync(Guid storeId)
        {
            return await _context.StoreUsers
                .Where(x => x.StoreId == storeId)
                .Select(x => x.UserId)
                .ToListAsync();
        }

        public async Task<List<Store>> GetStoresByUserIdAsync(Guid userId)
        {
            var storeIds = await _context.StoreUsers
                .Where(su => su.UserId == userId)
                .Select(su => su.StoreId)
                .ToListAsync();

            return await _context.Stores
                .Where(s => storeIds.Contains(s.Id))
                .ToListAsync();
        }

        public async Task UpdateStoreRatingAsync(Guid storeId)
        {
            var store = await _context.Stores
                .Include(s => s.StoreReviews.Where(r => r.Status == "Active"))
                .FirstOrDefaultAsync(s => s.Id == storeId);

            if (store != null)
            {
                var activeReviews = store.StoreReviews.Where(r => r.Status == "Active").ToList();

                if (activeReviews.Any())
                {
                    store.AverageRating = Math.Round(activeReviews.Average(r => r.Rating), 1);
                    store.TotalReviews = activeReviews.Count;
                }
                else
                {
                    store.AverageRating = 0;
                    store.TotalReviews = 0;
                }

                _context.Stores.Update(store);
            }
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
