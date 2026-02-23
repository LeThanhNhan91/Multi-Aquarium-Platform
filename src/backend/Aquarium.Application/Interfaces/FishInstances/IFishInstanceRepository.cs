using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.FishInstances
{
    public interface IFishInstanceRepository
    {
        Task<FishInstance?> GetByIdAsync(Guid id);
        Task<List<FishInstance>> GetByProductIdAsync(Guid productId);
        Task<List<FishInstance>> GetAvailableByProductIdAsync(Guid productId);
        Task<int> GetAvailableCountByProductIdAsync(Guid productId);
        Task<(decimal? min, decimal? max)> GetPriceRangeByProductIdAsync(Guid productId);
        Task AddAsync(FishInstance fishInstance);
        Task UpdateAsync(FishInstance fishInstance);
        Task DeleteAsync(FishInstance fishInstance);
        Task AddMediaAsync(FishInstanceMedia media);
        Task DeleteMediaAsync(FishInstanceMedia media);
        Task<List<FishInstanceMedia>> GetMediaByFishInstanceIdAsync(Guid fishInstanceId);
        Task<bool> SaveChangesAsync();
    }
}
