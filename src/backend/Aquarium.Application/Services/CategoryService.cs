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
            if (request.ParentId.HasValue)
            {
                bool parentExists = await _categoryRepository.ExistsCategoryParentAsync(request.ParentId.Value);
                if (!parentExists)
                {
                    throw new NotFoundException("Parent Category", request.ParentId.Value);
                }
            }

            var slug = Helper.GenerateSlug(request.Name);

            var newCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Slug = slug,
                Description = request.Description,
                ParentId = request.ParentId
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

            if (await _categoryRepository.HasSubCategoriesAsync(id))
                throw new BadRequestException("Cannot delete because it has sub-categories. Please delete children first.");

            await _categoryRepository.DeleteAsync(category);
            await _categoryRepository.SaveChangesAsync();
        }

        public async Task<List<CategoryTreeResponse>> GetCategoryTreeAsync()
        {
            // 1. Get all categories (Flat list)
            var allCategories = await _categoryRepository.GetAllAsync();

            // 2. Filter out the original categories. (Level 1 - ParentId == null)
            var rootCategories = allCategories.Where(c => c.ParentId == null).ToList();

            // 3. Use recursion to map children to each parent.
            return rootCategories.Select(c => MapToTreeResponse(c, allCategories)).ToList();
        }

        private CategoryTreeResponse MapToTreeResponse(Category cat, List<Category> allCats)
        {
            return new CategoryTreeResponse(
                cat.Id,
                cat.Name,
                cat.Slug,
                // Find the offspring of the current category in the total list.
                allCats
                    .Where(child => child.ParentId == cat.Id)
                    .Select(child => MapToTreeResponse(child, allCats))
                    .ToList()
            );
        }
    }
}
