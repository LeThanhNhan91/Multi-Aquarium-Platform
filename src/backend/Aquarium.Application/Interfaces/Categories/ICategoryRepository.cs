using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Categories
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(Guid id);
        Task AddAsync(Category category);
        Task UpdateAsync(Category category);
        Task DeleteAsync(Category category);
        Task<bool> HasProductsAsync(Guid categoryId);
        Task<bool> HasSubCategoriesAsync(Guid categoryId);
        Task<bool> ExistsCategoryParentAsync(Guid id);
        Task<bool> SaveChangesAsync();
    }
}
