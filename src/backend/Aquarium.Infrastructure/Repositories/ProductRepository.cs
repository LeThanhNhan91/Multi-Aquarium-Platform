using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Common;
using Aquarium.Application.DTOs.Products;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public ProductRepository (MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(Product product)
        {
            _context.Products.Remove(product);
            await Task.CompletedTask;
        }

        public async Task<Product?> GetByIdAsync(Guid id)
        {
            return await _context.Products
                .Include(p => p.Store)
                .Include(p => p.Category)
                .Include(p => p.ProductMedia)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<PagedResult<Product>> GetProductsByFilterAsync(GetProductsFilter filter)
        {
            var query = _context.Products
                .Include(p => p.Store)
                .Include(p => p.Category)
                .Include(p => p.Inventory)
                .Include(p => p.ProductMedia.Where(m => m.IsPrimary == true))
                .AsNoTracking()
                .AsQueryable();

            // 2. Apply Filters

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                query = query.Where(p => p.Name.Contains(filter.Keyword) ||
                                         p.Description.Contains(filter.Keyword));
            }

            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
            }

            if (filter.StoreId.HasValue)
            {
                query = query.Where(p => p.StoreId == filter.StoreId.Value);
            }

            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.BasePrice >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.BasePrice <= filter.MaxPrice.Value);

            query = query.Where(p => p.Status == "Active");

            query = filter.SortBy?.ToLower() switch
            {
                "price" => filter.IsDescending
                    ? query.OrderByDescending(p => p.BasePrice)
                    : query.OrderBy(p => p.BasePrice),
                "name" => filter.IsDescending
                    ? query.OrderByDescending(p => p.Name)
                    : query.OrderBy(p => p.Name),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Product>(items, totalCount, filter.PageIndex, filter.PageSize);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
