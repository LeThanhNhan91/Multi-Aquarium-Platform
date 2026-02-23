using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Categories;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Application.Interfaces.Categories
{
    public interface ICategoryRepository
    {
        Task<PagedResult<Category>> GetAllAsync(GetCategoryFilter filter);
        Task<Category?> GetByIdAsync(Guid id);
        Task<PagedResult<Category>> GetRootCategoriesAsync(GetCategoryFilter filter);
        Task<PagedResult<Category>> GetChildCategoriesAsync(Guid parentId, GetCategoryFilter filter);
        Task AddAsync(Category category);
        Task UpdateAsync(Category category);
        Task DeleteAsync(Category category);
        Task<bool> HasProductsAsync(Guid categoryId);
        Task<bool> HasSubCategoriesAsync(Guid categoryId);
        Task<bool> ExistsCategoryParentAsync(Guid id);
        Task<List<Guid>> GetAllDescendantIdsAsync(Guid categoryId);
        Task<int> GetLeafCategoryCountAsync(Guid categoryId);
        Task<Category?> GetRootCategoryAsync(Guid categoryId);
        Task<bool> SaveChangesAsync();
    }
}
