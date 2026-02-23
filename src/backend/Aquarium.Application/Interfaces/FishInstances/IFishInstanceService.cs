using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.FishInstances;

namespace Aquarium.Application.Interfaces.FishInstances
{
    public interface IFishInstanceService
    {
        Task<FishInstanceResponse> CreateFishInstanceAsync(Guid productId, CreateFishInstanceRequest request, Guid userId);
        Task<FishInstanceResponse> UpdateFishInstanceAsync(Guid productId, Guid fishInstanceId, UpdateFishInstanceRequest request, Guid userId);
        Task DeleteFishInstanceAsync(Guid productId, Guid fishInstanceId, Guid userId);
        Task<List<FishInstanceResponse>> GetFishInstancesByProductIdAsync(Guid productId);
        Task<FishInstanceResponse> GetFishInstanceByIdAsync(Guid productId, Guid fishInstanceId);
        Task AddFishInstanceMediaAsync(Guid productId, Guid fishInstanceId, AddFishInstanceMediaRequest request, Guid userId);
        Task UpdateFishInstanceVideoAsync(Guid productId, Guid fishInstanceId, UpdateFishInstanceVideoRequest request, Guid userId);
        Task DeleteFishInstanceMediaAsync(Guid productId, Guid fishInstanceId, Guid mediaId, Guid userId);
    }
}
