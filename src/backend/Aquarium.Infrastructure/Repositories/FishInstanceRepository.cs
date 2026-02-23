using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Application.Interfaces.FishInstances;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class FishInstanceRepository : IFishInstanceRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public FishInstanceRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task<FishInstance?> GetByIdAsync(Guid id)
        {
            return await _context.FishInstances
                .Include(f => f.FishInstanceMedia)
                .Include(f => f.Product)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<List<FishInstance>> GetByProductIdAsync(Guid productId)
        {
            return await _context.FishInstances
                .Include(f => f.FishInstanceMedia)
                .Where(f => f.ProductId == productId)
                .OrderBy(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<FishInstance>> GetAvailableByProductIdAsync(Guid productId)
        {
            return await _context.FishInstances
                .Include(f => f.FishInstanceMedia)
                .Where(f => f.ProductId == productId && f.Status == "Available")
                .OrderBy(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetAvailableCountByProductIdAsync(Guid productId)
        {
            return await _context.FishInstances
                .CountAsync(f => f.ProductId == productId && f.Status == "Available");
        }

        public async Task<(decimal? min, decimal? max)> GetPriceRangeByProductIdAsync(Guid productId)
        {
            var availableFish = await _context.FishInstances
                .Where(f => f.ProductId == productId && f.Status == "Available")
                .ToListAsync();

            if (!availableFish.Any())
            {
                return (null, null);
            }

            return (availableFish.Min(f => f.Price), availableFish.Max(f => f.Price));
        }

        public async Task AddAsync(FishInstance fishInstance)
        {
            await _context.FishInstances.AddAsync(fishInstance);
        }

        public async Task UpdateAsync(FishInstance fishInstance)
        {
            _context.FishInstances.Update(fishInstance);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(FishInstance fishInstance)
        {
            _context.FishInstances.Remove(fishInstance);
            await Task.CompletedTask;
        }

        public async Task AddMediaAsync(FishInstanceMedia media)
        {
            await _context.FishInstanceMedias.AddAsync(media);
        }

        public async Task DeleteMediaAsync(FishInstanceMedia media)
        {
            _context.FishInstanceMedias.Remove(media);
            await Task.CompletedTask;
        }

        public async Task<List<FishInstanceMedia>> GetMediaByFishInstanceIdAsync(Guid fishInstanceId)
        {
            return await _context.FishInstanceMedias
                .Where(m => m.FishInstanceId == fishInstanceId)
                .OrderBy(m => m.DisplayOrder)
                .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
