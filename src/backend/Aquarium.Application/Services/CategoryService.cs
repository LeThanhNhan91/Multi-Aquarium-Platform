using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using Aquarium.Application.DTOs.Categories;
using Aquarium.Application.Interfaces.Categories;
using Aquarium.Application.Wrappers;
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

        public async Task<PagedResult<CategoryResponse>> GetAllCategoriesAsync(GetCategoryFilter filter)
        {
            var categories = await _categoryRepository.GetAllAsync(filter);

            var categoriesResponse = categories.Items.Select(c => new CategoryResponse(
                c.Id,
                c.Name,
                c.Slug,
                c.Description
            )).ToList();

            return new PagedResult<CategoryResponse>(categoriesResponse, categories.TotalCount, categories.PageIndex, categories.PageSize);
        }

        public async Task<CategoryResponse> GetCategoryByIdAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) throw new NotFoundException("Category", id);

            return new CategoryResponse(category.Id, category.Name, category.Slug, category.Description);
        }

        public async Task<PagedResult<CategoryResponse>> GetRootCategoriesAsync(GetCategoryFilter filter)
        {
            var rootCategories = await _categoryRepository.GetRootCategoriesAsync(filter);

            var items = rootCategories.Items
                .Select(c => new CategoryResponse(
                    c.Id,
                    c.Name,
                    c.Slug,
                    c.Description
                )).ToList();

            return new PagedResult<CategoryResponse>(items, rootCategories.TotalCount, rootCategories.PageIndex, rootCategories.PageSize);
        }

        public async Task<PagedResult<CategoryResponse>> GetChildCategoriesAsync(Guid parentId, GetCategoryFilter filter)
        {
            // First check if the parent category exists
            var parentCategory = await _categoryRepository.GetByIdAsync(parentId);
            if (parentCategory == null)
            {
                throw new NotFoundException("Category", parentId);
            }

            // Get all direct children of this category with filter
            var children = await _categoryRepository.GetChildCategoriesAsync(parentId, filter);

            var items = children.Items
                .Select(c => new CategoryResponse(
                    c.Id,
                    c.Name,
                    c.Slug,
                    c.Description
                )).ToList();

            return new PagedResult<CategoryResponse>(items, children.TotalCount, children.PageIndex, children.PageSize);
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

        public async Task UpdateCategoryParentAsync(Guid categoryId, UpdateCategoryParentRequest request)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
            {
                throw new NotFoundException("Category", categoryId);
            }

            // If setting a parent, validate it exists
            if (request.ParentId.HasValue)
            {
                // Check parent exists
                var parentExists = await _categoryRepository.ExistsCategoryParentAsync(request.ParentId.Value);
                if (!parentExists)
                {
                    throw new NotFoundException("Parent Category", request.ParentId.Value);
                }

                // Prevent setting self as parent
                if (request.ParentId.Value == categoryId)
                {
                    throw new BadRequestException("A category cannot be its own parent");
                }

                // Prevent circular reference - check if the new parent is a descendant of this category
                if (await IsDescendantOf(request.ParentId.Value, categoryId))
                {
                    throw new BadRequestException("Cannot set parent: this would create a circular reference");
                }
            }

            category.ParentId = request.ParentId;
            await _categoryRepository.UpdateAsync(category);
            await _categoryRepository.SaveChangesAsync();
        }

        // Helper method to check if a category is a descendant of another
        private async Task<bool> IsDescendantOf(Guid potentialDescendantId, Guid ancestorId)
        {
            var potentialDescendant = await _categoryRepository.GetByIdAsync(potentialDescendantId);
            
            while (potentialDescendant != null && potentialDescendant.ParentId.HasValue)
            {
                if (potentialDescendant.ParentId.Value == ancestorId)
                {
                    return true;
                }
                potentialDescendant = await _categoryRepository.GetByIdAsync(potentialDescendant.ParentId.Value);
            }
            
            return false;
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

        public async Task<List<CategoryTreeResponse>> GetCategoryTreeAsync(GetCategoryFilter filter)
        {
            // 1. Get all categories (Flat list)
            var pagedCategories = await _categoryRepository.GetAllAsync(filter);
            var allCategories = pagedCategories.Items;

            // 2. Filter out the original categories. (Level 1 - ParentId == null)
            var rootCategories = allCategories.Where(c => c.ParentId == null).ToList();

            // 3. Use recursion to map children to each parent.
            return rootCategories.Select(c => MapToTreeResponse(c, allCategories.ToList())).ToList();
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
