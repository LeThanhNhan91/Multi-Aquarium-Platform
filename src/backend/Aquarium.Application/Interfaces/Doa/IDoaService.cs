using System;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Doa;
using Aquarium.Application.Wrappers;

namespace Aquarium.Application.Interfaces.Doa
{
    public interface IDoaService
    {
        Task<DoaRequestResponse> CreateDoaRequestAsync(CreateDoaRequest request, Guid customerId);
        Task<DoaRequestResponse> GetDoaRequestByIdAsync(Guid doaRequestId, Guid userId);
        Task<DoaRequestResponse?> GetDoaRequestByOrderAsync(Guid orderId, Guid userId);
        Task<DoaRequestResponse> ReviewDoaRequestAsync(Guid doaRequestId, ReviewDoaRequestRequest request, Guid reviewerId, Guid storeId);
        Task<PagedResult<DoaRequestResponse>> GetDoaRequestsByStoreAsync(Guid storeId, GetDoaRequestsFilter filter, Guid userId);
    }
}
