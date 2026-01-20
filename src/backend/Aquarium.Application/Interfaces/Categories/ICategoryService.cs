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
        Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request);
        Task DeleteCategoryAsync(Guid id);
    }
}
