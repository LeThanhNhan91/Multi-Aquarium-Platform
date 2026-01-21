using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces.Categories;
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

        public async Task<List<Category>> GetAllAsync()
        {
            return await _context.Categories.AsNoTracking().ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(Guid id)
        {
            return await _context.Categories.FindAsync(id);
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

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
