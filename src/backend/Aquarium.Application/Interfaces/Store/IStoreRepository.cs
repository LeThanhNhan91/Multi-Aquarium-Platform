using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Store;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces
{
    public interface IStoreRepository
    {
        Task<bool> ExistsBySlugAsync(string slug);
        Task AddAsync(Store store);
        Task AddStoreUserAsync(StoreUser storeUser);
        Task<bool> SaveChangesAsync();
        Task<Store?> GetByIdAsync(Guid storeId);
        Task<List<Store>> GetStoresByFilterAsync(GetStoresFilter filter);
        Task<Dictionary<Guid, string>> GetUserRolesInStoresAsync(Guid userId, List<Guid> storeIds);
        Task<List<StoreUser>> GetMembersAsync(Guid storeId);
        Task<bool> IsUserInStoreAsync(Guid storeId, Guid userId);
        Task<StoreUser?> GetStoreUserAsync(Guid storeId, Guid userId);
        Task RemoveMemberAsync(StoreUser storeUser);
    }
}
