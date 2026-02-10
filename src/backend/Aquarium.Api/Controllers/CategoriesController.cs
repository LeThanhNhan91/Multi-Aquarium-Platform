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
    public async Task<IActionResult> GetAll()
    {
        var result = await _categoryService.GetAllCategoriesAsync();
        return Ok(new ApiResponse<List<CategoryResponse>>(result));
    }

    [HttpGet("tree")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTree()
    {
        var result = await _categoryService.GetCategoryTreeAsync();
        return Ok(new ApiResponse<List<CategoryTreeResponse>>(result));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id);
        return Ok(new ApiResponse<CategoryResponse>(result));
    }

    [HttpGet("{id}/parent")]
    [AllowAnonymous]
    public async Task<IActionResult> GetParentCategory(Guid id)
    {
        var result = await _categoryService.GetParentCategoryAsync(id);
        
        if (result == null)
        {
            return Ok(new ApiResponse<CategoryResponse?>(null, "This category has no parent (it is a root category)"));
        }
        
        return Ok(new ApiResponse<CategoryResponse>(result));
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _categoryService.DeleteCategoryAsync(id);
        return Ok(new ApiResponse<object>(null, "Category deleted successfully"));
    }
}