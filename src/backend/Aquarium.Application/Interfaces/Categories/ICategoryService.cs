using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Categories;

namespace Aquarium.Application.Interfaces.Categories
{
    public interface ICategoryService
    {
        Task<List<CategoryResponse>> GetAllCategoriesAsync();
        Task<CategoryResponse> GetCategoryByIdAsync(Guid id);
        Task<List<CategoryResponse>> GetRootCategoriesAsync();
        Task<List<CategoryResponse>> GetChildCategoriesAsync(Guid parentId);
        Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request);
        Task DeleteCategoryAsync(Guid id);
        Task<List<CategoryTreeResponse>> GetCategoryTreeAsync();
    }
}
