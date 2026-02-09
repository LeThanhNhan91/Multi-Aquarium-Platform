using System.Security.Claims;
using Aquarium.Application.DTOs.Products;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdClaim.Value);
        }

        [HttpGet("products")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProducts([FromQuery] GetProductsFilter filter)
        {
            var pagedData = await _productService.GetProductsAsync(filter);

            return Ok(new ApiResponse<PagedResult<ProductResponse>>(pagedData));
        }

        [HttpGet("products/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            return Ok(new ApiResponse<ProductResponse>(product));
        }

        [HttpGet("stores/{storeId}/products")]
        [AllowAnonymous]
        public async Task<IActionResult> GetStoreProducts(Guid storeId, [FromQuery] GetProductsFilter filter)
        {
            filter.StoreId = storeId;
            var pagedData = await _productService.GetProductsAsync(filter);

            return Ok(new ApiResponse<PagedResult<ProductResponse>>(pagedData));
        }

        [HttpPost("stores/{storeId}/products")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateProduct(Guid storeId, [FromForm] CreateProductRequest request)
        {
            var userId = GetCurrentUserId();
            var response = await _productService.CreateProductAsync(request, userId);
            return CreatedAtAction(
                nameof(GetProductById),
                new { id = response.Id },
                new ApiResponse<ProductResponse>(response, "Product created successfully")
            );
        }

        [HttpDelete("products/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var userId = GetCurrentUserId();
            await _productService.DeleteProductAsync(id, userId);
            return Ok(new ApiResponse<object>(null, "Product deleted successfully"));
        }
    }
}
