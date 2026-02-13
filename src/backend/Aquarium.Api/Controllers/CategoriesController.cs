using Aquarium.Application.DTOs.Categories;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Categories;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] GetCategoryFilter filter)
    {
        var result = await _categoryService.GetAllCategoriesAsync(filter);
        return Ok(new ApiResponse<PagedResult<CategoryResponse>>(result));
    }

    [HttpGet("tree")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTree([FromQuery] GetCategoryFilter filter)
    {
        var result = await _categoryService.GetCategoryTreeAsync(filter);
        return Ok(new ApiResponse<List<CategoryTreeResponse>>(result));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id);
        return Ok(new ApiResponse<CategoryResponse>(result));
    }

    [HttpGet("parent")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRootCategories([FromQuery] GetCategoryFilter filter)
    {
        var result = await _categoryService.GetRootCategoriesAsync(filter);
        return Ok(new ApiResponse<PagedResult<CategoryResponse>>(result));
    }

    [HttpGet("{parentId}/child")]
    [AllowAnonymous]
    public async Task<IActionResult> GetChildCategories(Guid parentId, [FromQuery] GetCategoryFilter filter)
    {
        var result = await _categoryService.GetChildCategoriesAsync(parentId, filter);
        return Ok(new ApiResponse<PagedResult<CategoryResponse>>(result));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
    {
        var result = await _categoryService.CreateCategoryAsync(request);
        return CreatedAtAction(
            nameof(GetById), 
            new { id = result.Id }, 
            new ApiResponse<CategoryResponse>(result, "Category created successfully")
        );
    }

    [HttpPut("{id}/parent")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCategoryParent(Guid id, [FromBody] UpdateCategoryParentRequest request)
    {
        await _categoryService.UpdateCategoryParentAsync(id, request);
        return Ok(new ApiResponse<object>(null, "Category parent updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _categoryService.DeleteCategoryAsync(id);
        return Ok(new ApiResponse<object>(null, "Category deleted successfully"));
    }
}