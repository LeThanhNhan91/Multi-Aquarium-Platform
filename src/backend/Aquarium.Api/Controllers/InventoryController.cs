using System.Security.Claims;
using Aquarium.Application.DTOs.Inventory;
using Aquarium.Application.Interfaces.Inventory;
using Aquarium.Application.Wrappers;
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
            return Ok(new ApiResponse<object>(stock));
        }

        [HttpPost("update")]
        [Authorize]
        public async Task<IActionResult> UpdateStock(Guid productId, [FromBody] UpdateStockRequest request)
        {
            var userId = GetCurrentUserId();
            await _inventoryService.UpdateStockAsync(productId, request, userId);
            return Ok(new ApiResponse<object>(null, "Stock updated successfully"));
        }

        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetHistory(Guid productId)
        {
            var userId = GetCurrentUserId();
            var history = await _inventoryService.GetHistoryAsync(productId, userId);
            return Ok(new ApiResponse<object>(history));
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdClaim.Value);
        }
    }
}
