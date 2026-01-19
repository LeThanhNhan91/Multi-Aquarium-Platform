using System.Security.Claims;
using Aquarium.Application.DTOs.Products;
using Aquarium.Application.Interfaces.Products;
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
            var products = await _productService.GetProductsAsync(filter);
            return Ok(products);
        }

        [HttpGet("products/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            return Ok(product);
        }

        [HttpPost("stores/{storeId}/products")]
        [Authorize]
        public async Task<IActionResult> CreateProduct(Guid storeId, [FromBody] CreateProductRequest request)
        {
            var userId = GetCurrentUserId();
            var response = await _productService.CreateProductAsync(storeId, request, userId);
            return CreatedAtAction(nameof(GetProductById), new { id = response.Id }, response);
        }

        [HttpDelete("products/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var userId = GetCurrentUserId();
            await _productService.DeleteProductAsync(id, userId);
            return NoContent();
        }
    }
}
