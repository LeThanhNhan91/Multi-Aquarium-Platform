using System;
using System.Collections.Generic;
using System.Text;
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
    }
}
