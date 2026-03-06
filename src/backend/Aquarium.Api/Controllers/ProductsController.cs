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
            Guid? currentUserId = null;
            try
            {
                currentUserId = GetCurrentUserId();
            }
            catch (UnauthorizedAccessException) { /* Guest user */ }

            var pagedData = await _productService.GetProductsAsync(filter, currentUserId);

            return Ok(new ApiResponse<PagedResult<ProductResponse>>(pagedData));
        }

        [HttpGet("products/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            Guid? currentUserId = null;
            try
            {
                currentUserId = GetCurrentUserId();
            }
            catch (UnauthorizedAccessException) { /* Guest user */ }

            var product = await _productService.GetProductByIdAsync(id, currentUserId);
            return Ok(new ApiResponse<ProductResponse>(product));
        }

        [HttpGet("products/stores/{storeId}")]
        [Authorize]
        public async Task<IActionResult> GetStoreProducts(Guid storeId, [FromQuery] GetProductsFilter filter)
        {
            var userId = GetCurrentUserId();
            var pagedData = await _productService.GetMyStoreProductsAsync(storeId, userId, filter);

            return Ok(new ApiResponse<PagedResult<ProductResponse>>(pagedData));
        }

        
        [HttpPost("products")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateProduct([FromForm] CreateProductRequest request)
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

        
        [HttpPut("products/{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveProduct(Guid id, [FromBody] ApproveProductRequest request)
        {
            var adminUserId = GetCurrentUserId();
            var response = await _productService.ApproveProductAsync(id, adminUserId, request);
            return Ok(new ApiResponse<ProductApprovalResponse>(response, "Product approved successfully"));
        }

        [HttpPut("products/{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectProduct(Guid id, [FromBody] RejectProductRequest request)
        {
            var adminUserId = GetCurrentUserId();
            var response = await _productService.RejectProductAsync(id, adminUserId, request);
            return Ok(new ApiResponse<ProductApprovalResponse>(response, "Product rejected"));
        }
    }
}
