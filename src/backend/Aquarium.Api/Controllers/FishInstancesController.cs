using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.FishInstances;
using Aquarium.Application.Interfaces.FishInstances;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api/products/{productId}/fish-instances")]
    [Authorize]
    public class FishInstancesController : ControllerBase
    {
        private readonly IFishInstanceService _fishInstanceService;

        public FishInstancesController(IFishInstanceService fishInstanceService)
        {
            _fishInstanceService = fishInstanceService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdClaim.Value);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetFishInstances(Guid productId)
        {
            var fishInstances = await _fishInstanceService.GetFishInstancesByProductIdAsync(productId);
            return Ok(new ApiResponse<System.Collections.Generic.List<FishInstanceResponse>>(fishInstances));
        }

        [HttpGet("{fishInstanceId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFishInstance(Guid productId, Guid fishInstanceId)
        {
            var fishInstance = await _fishInstanceService.GetFishInstanceByIdAsync(productId, fishInstanceId);
            return Ok(new ApiResponse<FishInstanceResponse>(fishInstance));
        }

        [HttpPost]
        [Authorize(Roles = "StoreOwner,Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateFishInstance(Guid productId, [FromForm] CreateFishInstanceRequest request)
        {
            var userId = GetCurrentUserId();
            var fishInstance = await _fishInstanceService.CreateFishInstanceAsync(productId, request, userId);
            return Ok(new ApiResponse<FishInstanceResponse>(fishInstance, "Fish instance created successfully"));
        }

        [HttpPut("{fishInstanceId}")]
        [Authorize(Roles = "StoreOwner,Admin")]
        public async Task<IActionResult> UpdateFishInstance(Guid productId, Guid fishInstanceId, [FromBody] UpdateFishInstanceRequest request)
        {
            var userId = GetCurrentUserId();
            var fishInstance = await _fishInstanceService.UpdateFishInstanceAsync(productId, fishInstanceId, request, userId);
            return Ok(new ApiResponse<FishInstanceResponse>(fishInstance, "Fish instance updated successfully"));
        }

        [HttpDelete("{fishInstanceId}")]
        [Authorize(Roles = "StoreOwner,Admin")]
        public async Task<IActionResult> DeleteFishInstance(Guid productId, Guid fishInstanceId)
        {
            var userId = GetCurrentUserId();
            await _fishInstanceService.DeleteFishInstanceAsync(productId, fishInstanceId, userId);
            return Ok(new ApiResponse<object>(null, "Fish instance deleted successfully"));
        }

        [HttpPost("{fishInstanceId}/media")]
        [Authorize(Roles = "StoreOwner,Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddFishInstanceMedia(Guid productId, Guid fishInstanceId, [FromForm] AddFishInstanceMediaRequest request)
        {
            var userId = GetCurrentUserId();
            await _fishInstanceService.AddFishInstanceMediaAsync(productId, fishInstanceId, request, userId);
            return Ok(new ApiResponse<object>(null, "Media added successfully"));
        }

        [HttpPut("{fishInstanceId}/video")]
        [Authorize(Roles = "StoreOwner,Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateFishInstanceVideo(Guid productId, Guid fishInstanceId, [FromForm] UpdateFishInstanceVideoRequest request)
        {
            var userId = GetCurrentUserId();
            await _fishInstanceService.UpdateFishInstanceVideoAsync(productId, fishInstanceId, request, userId);
            return Ok(new ApiResponse<object>(null, "Video updated successfully"));
        }

        [HttpDelete("{fishInstanceId}/media/{mediaId}")]
        [Authorize(Roles = "StoreOwner,Admin")]
        public async Task<IActionResult> DeleteFishInstanceMedia(Guid productId, Guid fishInstanceId, Guid mediaId)
        {
            var userId = GetCurrentUserId();
            await _fishInstanceService.DeleteFishInstanceMediaAsync(productId, fishInstanceId, mediaId, userId);
            return Ok(new ApiResponse<object>(null, "Media deleted successfully"));
        }
    }
}
