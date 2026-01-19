using System;
using System.Collections.Generic;
using System.Text;
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

        public async Task<List<Product>> GetProductsByFilterAsync(GetProductsFilter filter)
        {
            var query = _context.Products
                .Include(p => p.Store)
                .Include(p => p.Category)
                .Include(p => p.ProductMedia)
                .AsQueryable();

            if (filter.StoreId.HasValue) query = query.Where(p => p.StoreId == filter.StoreId);

            if (filter.CategoryId.HasValue) query = query.Where(p => p.CategoryId == filter.CategoryId);

            if (filter.MinPrice.HasValue) query = query.Where(p => p.BasePrice >= filter.MinPrice);

            if (filter.MaxPrice.HasValue) query = query.Where(p => p.BasePrice <= filter.MaxPrice);

            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                query = query.Where(p => p.Name.Contains(filter.SearchTerm));

            return await query.ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
