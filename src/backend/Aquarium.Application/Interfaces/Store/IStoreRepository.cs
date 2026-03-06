using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Stores;
using StoreEntity = Aquarium.Domain.Entities.Store;
using Aquarium.Domain.Entities;
using Aquarium.Application.Wrappers;

namespace Aquarium.Application.Interfaces
{
    public interface IStoreRepository
    {
        Task<bool> ExistsBySlugAsync(string slug);
        Task AddAsync(StoreEntity store);
        Task UpdateAsync(StoreEntity store);
        Task AddStoreUserAsync(StoreUser storeUser);
        Task<bool> SaveChangesAsync();
        Task<StoreEntity?> GetByIdAsync(Guid storeId);
        Task<PagedResult<StoreEntity>> GetStoresByFilterAsync(GetStoresFilter filter);
        Task<Dictionary<Guid, string>> GetUserRolesInStoresAsync(Guid userId, List<Guid> storeIds);
        Task<List<StoreUser>> GetMembersAsync(Guid storeId);
        Task<bool> IsUserInStoreAsync(Guid storeId, Guid userId);
        Task<StoreUser?> GetStoreUserAsync(Guid storeId, Guid userId);
        Task RemoveMemberAsync(StoreUser storeUser);
        Task<List<Guid>> GetStoreStaffIdsAsync(Guid storeId);
        Task<Guid?> GetStoreIdByUserIdAsync(Guid userId);
        Task<List<StoreEntity>> GetStoresByUserIdAsync(Guid userId);
        Task<Dictionary<Guid, (int ProductCount, int OrderCount)>> GetStoreCountsAsync(List<Guid> storeIds);
        Task UpdateStoreRatingAsync(Guid storeId);
    }
}
