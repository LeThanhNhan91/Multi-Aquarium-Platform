using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Stores;
using Aquarium.Application.DTOs.StoreMember;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Wrappers;
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

            var pagedResult = await _storeService.GetStoresAsync(filter, currentUserId);
            return Ok(new ApiResponse<PagedResult<StoreResponse>>(pagedResult));
        }

        [HttpPost]
        public async Task<IActionResult> CreateStore([FromBody] CreateStoreRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (userIdClaim == null) return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            var response = await _storeService.CreateStoreAsync(request, userId);

            return CreatedAtAction(
                nameof(CreateStore),
                new { id = response.Id },
                new ApiResponse<StoreResponse>(response, "Store created successfully")
            );
        }

        [HttpPut("{id}/info")]
        [Authorize(Roles = "StoreOwner,Manager")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateStoreInfo(Guid id, [FromForm] UpdateStoreInfoRequest request)
        {
            await _storeService.UpdateStoreInfoAsync(id, request);
            return Ok(new ApiResponse<object>(null, "Store info updated successfully."));
        }

        [HttpPatch("{storeId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStoreStatus(Guid storeId, [FromBody] UpdateStoreStatusRequest request)
        {
            await _storeService.UpdateStoreStatusAsync(storeId, request);
            return Ok(new ApiResponse<object>(null, $"Store status updated to '{request.Status}' successfully."));
        }

        [HttpGet("{storeId}/members")]
        public async Task<IActionResult> GetMembers(Guid storeId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var members = await _storeService.GetStoreMembersAsync(storeId, userId);

            return Ok(new ApiResponse<List<StoreMemberResponse>>(members));
        }

        [HttpPost("{storeId}/members")]
        public async Task<IActionResult> AddMember(Guid storeId, [FromBody] AddStoreMemberRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _storeService.AddMemberAsync(storeId, userId, request);
            return Ok(new ApiResponse<object>(null, "Member added successfully."));
        }

        [HttpDelete("{storeId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(Guid storeId, Guid memberId)
        {
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _storeService.RemoveMemberAsync(storeId, currentUserId, memberId);
            return Ok(new ApiResponse<object>(null, "Member removed successfully."));
        }

        
        [HttpPut("{storeId}/logo")]
        [Authorize]
        public async Task<IActionResult> UpdateStoreLogo(Guid storeId, [FromForm] UpdateStoreLogoRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var response = await _storeService.UpdateStoreLogoAsync(storeId, userId, request);
            return Ok(new ApiResponse<UpdateStoreMediaResponse>(response, "Logo updated successfully"));
        }

        
        [HttpPut("{storeId}/cover")]
        [Authorize]
        public async Task<IActionResult> UpdateStoreCover(Guid storeId, [FromForm] UpdateStoreCoverRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var response = await _storeService.UpdateStoreCoverAsync(storeId, userId, request);
            return Ok(new ApiResponse<UpdateStoreMediaResponse>(response, "Cover image updated successfully"));
        }

        [HttpPut("{storeId}/approve")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> ApproveStore(Guid storeId, [FromBody] ApproveStoreRequest request)
        {
            var adminUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var response = await _storeService.ApproveStoreAsync(storeId, adminUserId);
            return Ok(new ApiResponse<StoreApprovalResponse>(response, "Store approved successfully"));
        }

        [HttpPut("{storeId}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectStore(Guid storeId, [FromBody] RejectStoreRequest request)
        {
            var adminUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var response = await _storeService.RejectStoreAsync(storeId, adminUserId, request);
            return Ok(new ApiResponse<StoreApprovalResponse>(response, "Store rejected"));
        }
    }
}