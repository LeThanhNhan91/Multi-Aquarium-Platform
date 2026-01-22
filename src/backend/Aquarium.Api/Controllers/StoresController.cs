using System.Security.Claims;
using Aquarium.Application.DTOs.Stores;
using Aquarium.Application.DTOs.StoreMember;
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

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetStores([FromQuery] GetStoresFilter filter)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var currentUserId = userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;

            if (currentUserId == Guid.Empty && string.IsNullOrEmpty(filter.Status) && filter.StoreId == null)
            {
                filter.Status = "Active";
            }

            var stores = await _storeService.GetStoresAsync(filter, currentUserId);
            return Ok(stores);
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

        [HttpPut("{id}/info")]
        [Authorize(Roles = "StoreOwner,Manager")]
        public async Task<IActionResult> UpdateStoreInfo(Guid id, [FromBody] UpdateStoreInfoRequest request)
        {
            await _storeService.UpdateStoreInfoAsync(id, request);
            return Ok(new { message = "Store info updated successfully." });
        }

        [HttpPatch("{storeId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStoreStatus(Guid storeId, [FromBody] UpdateStoreStatusRequest request)
        {
            await _storeService.UpdateStoreStatusAsync(storeId, request);
            return Ok(new { message = $"Store status updated to '{request.Status}' successfully." });
        }

        [HttpGet("{storeId}/members")]
        public async Task<IActionResult> GetMembers(Guid storeId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var members = await _storeService.GetStoreMembersAsync(storeId, userId);
            return Ok(members);
        }

        [HttpPost("{storeId}/members")]
        public async Task<IActionResult> AddMember(Guid storeId, [FromBody] AddStoreMemberRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _storeService.AddMemberAsync(storeId, userId, request);
            return Ok(new { message = "Member added successfully." });
        }

        [HttpDelete("{storeId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(Guid storeId, Guid memberId)
        {
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _storeService.RemoveMemberAsync(storeId, currentUserId, memberId);
            return Ok(new { message = "Member removed successfully." });
        }
    }
}
