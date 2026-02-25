using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.StoreMember;
using Aquarium.Application.DTOs.Stores;
using Aquarium.Application.Wrappers;

namespace Aquarium.Application.Interfaces
{
    public interface IStoreService
    {
        Task<StoreResponse> CreateStoreAsync(CreateStoreRequest request, Guid userId);
        Task UpdateStoreInfoAsync(Guid storeId, UpdateStoreInfoRequest request);
        Task UpdateStoreStatusAsync(Guid storeId, UpdateStoreStatusRequest request);
        Task<PagedResult<StoreResponse>> GetStoresAsync(GetStoresFilter filter, Guid currentUserId);
        Task AddMemberAsync(Guid storeId, Guid currentUserId, AddStoreMemberRequest request);
        Task RemoveMemberAsync(Guid storeId, Guid currentUserId, Guid memberIdToRemove);
        Task<List<StoreMemberResponse>> GetStoreMembersAsync(Guid storeId, Guid currentUserId);
        
        // Media Upload
        Task<UpdateStoreMediaResponse> UpdateStoreLogoAsync(Guid storeId, Guid currentUserId, UpdateStoreLogoRequest request);
        Task<UpdateStoreMediaResponse> UpdateStoreCoverAsync(Guid storeId, Guid currentUserId, UpdateStoreCoverRequest request);
        
        // Admin Approval
        Task<StoreApprovalResponse> ApproveStoreAsync(Guid storeId, Guid adminUserId);
        Task<StoreApprovalResponse> RejectStoreAsync(Guid storeId, Guid adminUserId, RejectStoreRequest request);
        Task<StoreResponse> GetStoreByIdAsync(Guid storeId);
    }
}
