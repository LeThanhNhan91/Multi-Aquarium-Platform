using System.Security.Claims;
using Aquarium.Application.DTOs.Store;
using Aquarium.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StoresController : ControllerBase
    {
        private readonly IStoreService _storeService;

        public StoresController(IStoreService storeService)
        {
            _storeService = storeService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateStore([FromBody] CreateStoreRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (userIdClaim == null) return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            var response = await _storeService.CreateStoreAsync(request, userId);

            return CreatedAtAction(nameof(CreateStore), new { id = response.Id }, response);
        }

        [HttpPatch("{storeId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStoreStatus(Guid storeId, [FromBody] UpdateStoreStatusRequest request)
        {
            await _storeService.UpdateStoreStatusAsync(storeId, request);
            return Ok(new { message = $"Store status updated to '{request.Status}' successfully." });
        }
    }
}
