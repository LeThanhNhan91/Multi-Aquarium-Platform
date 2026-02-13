using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Categories;
using Aquarium.Application.Wrappers;

namespace Aquarium.Application.Interfaces.Categories
{
    public interface ICategoryService
    {
        Task<PagedResult<CategoryResponse>> GetAllCategoriesAsync(GetCategoryFilter filter);
        Task<CategoryResponse> GetCategoryByIdAsync(Guid id);
        Task<PagedResult<CategoryResponse>> GetRootCategoriesAsync(GetCategoryFilter filter);
        Task<PagedResult<CategoryResponse>> GetChildCategoriesAsync(Guid parentId, GetCategoryFilter filter);
        Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request);
        Task UpdateCategoryParentAsync(Guid categoryId, UpdateCategoryParentRequest request);
        Task DeleteCategoryAsync(Guid id);
        Task<List<CategoryTreeResponse>> GetCategoryTreeAsync(GetCategoryFilter filter);
    }
}
