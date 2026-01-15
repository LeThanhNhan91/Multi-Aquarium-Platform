using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Store;
using Aquarium.Application.DTOs.StoreMember;

namespace Aquarium.Application.Interfaces
{
    public interface IStoreService
    {
        Task<StoreResponse> CreateStoreAsync(CreateStoreRequest request, Guid userId);
        Task UpdateStoreStatusAsync(Guid storeId, UpdateStoreStatusRequest request);
        Task<List<StoreResponse>> GetStoresAsync(GetStoresFilter filter, Guid currentUserId);
        Task AddMemberAsync(Guid storeId, Guid currentUserId, AddStoreMemberRequest request);
        Task RemoveMemberAsync(Guid storeId, Guid currentUserId, Guid memberIdToRemove);
        Task<List<StoreMemberResponse>> GetStoreMembersAsync(Guid storeId, Guid currentUserId);
    }
}
