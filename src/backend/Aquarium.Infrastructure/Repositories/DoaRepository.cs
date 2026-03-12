using System;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Doa;
using Aquarium.Application.Interfaces.Doa;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class DoaRepository : IDoaRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public DoaRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task AddAsync(DoaRequest entity)
        {
            await _context.DoaRequests.AddAsync(entity);
        }

        public async Task<DoaRequest?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _context.DoaRequests
                .Include(d => d.Customer)
                .Include(d => d.ReviewedByUser)
                .Include(d => d.Media)
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<DoaRequest?> GetByOrderIdAsync(Guid orderId)
        {
            return await _context.DoaRequests
                .FirstOrDefaultAsync(d => d.OrderId == orderId);
        }

        public async Task<PagedResult<DoaRequest>> GetByStoreAsync(Guid storeId, GetDoaRequestsFilter filter)
        {
            var query = _context.DoaRequests
                .Include(d => d.Customer)
                .Include(d => d.ReviewedByUser)
                .Include(d => d.Media)
                .Where(d => d.Order.StoreId == storeId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Status))
                query = query.Where(d => d.Status == filter.Status);

            query = filter.SortBy?.ToLower() switch
            {
                "status" => filter.IsDescending
                    ? query.OrderByDescending(d => d.Status)
                    : query.OrderBy(d => d.Status),
                _ => filter.IsDescending
                    ? query.OrderByDescending(d => d.CreatedAt)
                    : query.OrderBy(d => d.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<DoaRequest>(items, totalCount, filter.PageIndex, filter.PageSize);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
