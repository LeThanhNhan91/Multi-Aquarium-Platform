using System;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Doa;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Doa
{
    public interface IDoaRepository
    {
        Task AddAsync(DoaRequest entity);
        Task<DoaRequest?> GetByIdWithDetailsAsync(Guid id);
        Task<DoaRequest?> GetByOrderIdAsync(Guid orderId);
        Task<PagedResult<DoaRequest>> GetByStoreAsync(Guid storeId, GetDoaRequestsFilter filter);
        Task<bool> SaveChangesAsync();
    }
}
