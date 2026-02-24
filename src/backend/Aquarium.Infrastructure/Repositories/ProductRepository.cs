using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Products;
using Aquarium.Application.Interfaces.Categories;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly MultiStoreAquariumDBContext _context;
        private readonly ICategoryRepository _categoryRepository;

        public ProductRepository(MultiStoreAquariumDBContext context, ICategoryRepository categoryRepository)
        {
            _context = context;
            _categoryRepository = categoryRepository;
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
                .Include(p => p.ProductReviews.Where(r => r.Status == "Active"))
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<PagedResult<Product>> GetProductsByFilterAsync(GetProductsFilter filter)
        {
            var query = _context.Products
                .Include(p => p.Store)
                .Include(p => p.Category)
                .Include(p => p.Inventory)
                .Include(p => p.ProductMedia.Where(m => m.IsPrimary == true))
                .Include(p => p.ProductReviews.Where(r => r.Status == "Active"))
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
                // Get all descendant category IDs
                var descendantIds = await _categoryRepository.GetAllDescendantIdsAsync(filter.CategoryId.Value);
                
                // Include the parent category + all descendants
                var allCategoryIds = new List<Guid> { filter.CategoryId.Value };
                allCategoryIds.AddRange(descendantIds);
                
                // Filter products in any of these categories
                query = query.Where(p => allCategoryIds.Contains(p.CategoryId));
            }

            if (filter.StoreId.HasValue)
            {
                query = query.Where(p => p.StoreId == filter.StoreId.Value);
            }

            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.BasePrice >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.BasePrice <= filter.MaxPrice.Value);

            if (filter.AverageRating.HasValue)
                query = query.Where(p => p.AverageRating >= filter.AverageRating.Value);

            query = query.Where(p => p.Status == "Active");

            query = filter.SortBy?.ToLower() switch
            {
                "price" => filter.IsDescending
                    ? query.OrderByDescending(p => p.BasePrice)
                    : query.OrderBy(p => p.BasePrice),
                "name" => filter.IsDescending
                    ? query.OrderByDescending(p => p.Name)
                    : query.OrderBy(p => p.Name),
                "averagerating" => filter.IsDescending
                    ? query.OrderByDescending(p => p.AverageRating)
                    : query.OrderBy(p => p.AverageRating),
                "totalreviews" => filter.IsDescending
                    ? query.OrderByDescending(p => p.TotalReviews)
                    : query.OrderBy(p => p.TotalReviews),
                "newest" => filter.IsDescending
                    ? query.OrderByDescending(p => p.CreatedAt)
                    : query.OrderBy(p => p.CreatedAt),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Product>(items, totalCount, filter.PageIndex, filter.PageSize);
        }

        //Functions for System Admin (not limited by StoreContext)
        public async Task<List<Product>> GetAllProductsAnyStoreAsync()
        {
            return await _context.Products
                .IgnoreQueryFilters()
                .ToListAsync();
        }

        public async Task<List<Product>> GetByIdsAsync(List<Guid> ids)
        {
            return await _context.Products
                .Include(p => p.Inventory)
                .Include(p => p.ProductMedia)
                .Where(p => ids.Contains(p.Id) && p.Status == "Active")
                .ToListAsync();
        }

        public async Task UpdateProductRatingAsync(Guid productId)
        {
            var product = await _context.Products
                .Include(p => p.ProductReviews.Where(r => r.Status == "Active"))
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product != null)
            {
                var activeReviews = product.ProductReviews.Where(r => r.Status == "Active").ToList();
                
                if (activeReviews.Any())
                {
                    product.AverageRating = Math.Round(activeReviews.Average(r => r.Rating), 1);
                    product.TotalReviews = activeReviews.Count;
                }
                else
                {
                    product.AverageRating = 0;
                    product.TotalReviews = 0;
                }

                _context.Products.Update(product);
            }
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
