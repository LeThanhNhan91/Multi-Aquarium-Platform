using System.Security.Claims;
using Aquarium.Application.DTOs.Inventory;
using Aquarium.Application.Interfaces.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api/products/{productId}/inventory")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetStock(Guid productId)
        {
            var stock = await _inventoryService.GetStockAsync(productId);
            return Ok(stock);
        }

        [HttpPost("update")]
        [Authorize]
        public async Task<IActionResult> UpdateStock(Guid productId, [FromBody] UpdateStockRequest request)
        {
            var userId = GetCurrentUserId();
            await _inventoryService.UpdateStockAsync(productId, request, userId);
            return Ok(new { message = "Stock updated successfully." });
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdClaim.Value);
        }
    }
}
