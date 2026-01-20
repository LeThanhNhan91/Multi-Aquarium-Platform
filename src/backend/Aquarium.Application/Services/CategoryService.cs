using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using Aquarium.Application.DTOs.Categories;
using Aquarium.Application.Interfaces.Categories;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<List<CategoryResponse>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Select(c => new CategoryResponse(c.Id, c.Name, c.Slug, c.Description)).ToList();
        }

        public async Task<CategoryResponse> GetCategoryByIdAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) throw new NotFoundException("Category", id);

            return new CategoryResponse(category.Id, category.Name, category.Slug, category.Description);
        }

        public async Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request)
        {
            var slug = Helper.GenerateSlug(request.Name);

            var newCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Slug = slug,
                Description = request.Description
            };

            await _categoryRepository.AddAsync(newCategory);
            await _categoryRepository.SaveChangesAsync();

            return new CategoryResponse(newCategory.Id, newCategory.Name, newCategory.Slug, newCategory.Description);
        }

        public async Task DeleteCategoryAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) throw new NotFoundException("Category", id);

            bool hasProducts = await _categoryRepository.HasProductsAsync(id);
            if (hasProducts)
            {
                throw new BadRequestException($"Cannot delete category '{category.Name}' because it contains products. Please delete or move products first.");
            }

            await _categoryRepository.DeleteAsync(category);
            await _categoryRepository.SaveChangesAsync();
        }
    }
}
