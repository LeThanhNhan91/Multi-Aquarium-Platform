using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Categories;
using Aquarium.Application.Interfaces.Categories;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public CategoryRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<Category>> GetAllAsync(GetCategoryFilter filter)
        {
            var query = _context.Categories.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                query = query.Where(p => p.Name.Contains(filter.Keyword) ||
                                         p.Description.Contains(filter.Keyword));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Category>(items, totalCount, filter.PageIndex, filter.PageSize);
        }

        public async Task<Category?> GetByIdAsync(Guid id)
        {
            return await _context.Categories.FindAsync(id);
        }

        public async Task<PagedResult<Category>> GetRootCategoriesAsync(GetCategoryFilter filter)
        {
            var query = _context.Categories
                .AsNoTracking()
                .Where(c => c.ParentId == null);

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                query = query.Where(c => c.Name.Contains(filter.Keyword) ||
                                         (c.Description != null && c.Description.Contains(filter.Keyword)));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Category>(items, totalCount, filter.PageIndex, filter.PageSize);
        }

        public async Task<PagedResult<Category>> GetChildCategoriesAsync(Guid parentId, GetCategoryFilter filter)
        {
            var query = _context.Categories
                .AsNoTracking()
                .Where(c => c.ParentId == parentId);

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                query = query.Where(c => c.Name.Contains(filter.Keyword) ||
                                         (c.Description != null && c.Description.Contains(filter.Keyword)));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Category>(items, totalCount, filter.PageIndex, filter.PageSize);
        }

        public async Task AddAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
        }

        public async Task UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(Category category)
        {
            _context.Categories.Remove(category);
            await Task.CompletedTask;
        }

        public async Task<bool> HasProductsAsync(Guid categoryId)
        {
            return await _context.Products.AnyAsync(p => p.CategoryId == categoryId);
        }

        public async Task<bool> HasSubCategoriesAsync(Guid categoryId)
        {
            return await _context.Categories.AnyAsync(c => c.ParentId == categoryId);
        }

        public async Task<bool> ExistsCategoryParentAsync(Guid id)
        {
            return await _context.Categories.AnyAsync(c => c.Id == id);
        }

        public async Task<List<Guid>> GetAllDescendantIdsAsync(Guid categoryId)
        {
            var descendantIds = new List<Guid>();
            await GetDescendantsRecursive(categoryId, descendantIds);
            return descendantIds;
        }

        private async Task GetDescendantsRecursive(Guid categoryId, List<Guid> descendantIds)
        {
            // Get direct children
            var children = await _context.Categories
                .AsNoTracking()
                .Where(c => c.ParentId == categoryId)
                .Select(c => c.Id)
                .ToListAsync();

            // Add children to the list
            descendantIds.AddRange(children);

            // Recursively get descendants of each child
            foreach (var childId in children)
            {
                await GetDescendantsRecursive(childId, descendantIds);
            }
        }

        public async Task<int> GetLeafCategoryCountAsync(Guid categoryId)
        {
            // Get all descendant category IDs
            var descendantIds = await GetAllDescendantIdsAsync(categoryId);
            
            if (descendantIds.Count == 0)
            {
                // This is a leaf category (no children)
                return 1;
            }

            // Count only leaf categories (categories with no children)
            var leafCategoryCount = 0;

            foreach (var descendantId in descendantIds)
            {
                var hasChildren = await _context.Categories
                    .AnyAsync(c => c.ParentId == descendantId);
                
                if (!hasChildren)
                {
                    leafCategoryCount++;
                }
            }

            return leafCategoryCount;
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
