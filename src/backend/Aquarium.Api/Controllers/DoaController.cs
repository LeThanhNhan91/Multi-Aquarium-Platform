using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Doa;
using Aquarium.Application.Interfaces.Doa;
using Aquarium.Application.Interfaces.Media;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api")]
    public class DoaController : ControllerBase
    {
        private readonly IDoaService _doaService;
        private readonly IMediaService _mediaService;

        public DoaController(IDoaService doaService, IMediaService mediaService)
        {
            _doaService = doaService;
            _mediaService = mediaService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdClaim.Value);
        }

        [HttpPost("orders/{orderId}/doa")]
        [Authorize]
        public async Task<IActionResult> CreateDoaRequest(
            Guid orderId,
            [FromForm] CreateDoaRequestFormRequest formRequest)
        {
            var userId = GetCurrentUserId();

            // Upload evidence media (images + videos) via Cloudinary
            var mediaItems = new List<DoaMediaItem>();

            if (formRequest.Images?.Count > 0)
            {
                foreach (var image in formRequest.Images)
                {
                    var result = await _mediaService.UploadImageAsync(image);
                    mediaItems.Add(new DoaMediaItem
                    {
                        Url = result.Url,
                        PublicId = result.PublicId,
                        MediaType = "Image"
                    });
                }
            }

            if (formRequest.Videos?.Count > 0)
            {
                foreach (var video in formRequest.Videos)
                {
                    var result = await _mediaService.UploadVideoAsync(video);
                    mediaItems.Add(new DoaMediaItem
                    {
                        Url = result.Url,
                        PublicId = result.PublicId,
                        MediaType = "Video"
                    });
                }
            }

            var serviceRequest = new CreateDoaRequest
            {
                OrderId = orderId,
                Reason = formRequest.Reason,
                Media = mediaItems.Count > 0 ? mediaItems : null
            };

            var response = await _doaService.CreateDoaRequestAsync(serviceRequest, userId);
            return CreatedAtAction(
                nameof(GetDoaRequestById),
                new { doaId = response.Id },
                new ApiResponse<DoaRequestResponse>(response, "DOA request submitted successfully"));
        }

        [HttpGet("orders/{orderId}/doa")]
        [Authorize]
        public async Task<IActionResult> GetDoaRequestByOrder(Guid orderId)
        {
            var userId = GetCurrentUserId();
            var response = await _doaService.GetDoaRequestByOrderAsync(orderId, userId);
            if (response == null)
                return NotFound(new ApiResponse<object>(null, "No DOA request found for this order"));
            return Ok(new ApiResponse<DoaRequestResponse>(response));
        }

        [HttpGet("doa/{doaId}")]
        [Authorize]
        public async Task<IActionResult> GetDoaRequestById(Guid doaId)
        {
            var userId = GetCurrentUserId();
            var response = await _doaService.GetDoaRequestByIdAsync(doaId, userId);
            return Ok(new ApiResponse<DoaRequestResponse>(response));
        }

        [HttpGet("stores/{storeId}/doa")]
        [Authorize]
        public async Task<IActionResult> GetDoaRequestsByStore(
            Guid storeId,
            [FromQuery] GetDoaRequestsFilter filter)
        {
            var userId = GetCurrentUserId();
            var response = await _doaService.GetDoaRequestsByStoreAsync(storeId, filter, userId);
            return Ok(new ApiResponse<PagedResult<DoaRequestResponse>>(response));
        }

        [HttpPatch("stores/{storeId}/doa/{doaId}/review")]
        [Authorize]
        public async Task<IActionResult> ReviewDoaRequest(
            Guid storeId,
            Guid doaId,
            [FromBody] ReviewDoaRequestRequest request)
        {
            var userId = GetCurrentUserId();
            var response = await _doaService.ReviewDoaRequestAsync(doaId, request, userId, storeId);
            return Ok(new ApiResponse<DoaRequestResponse>(response, $"DOA request {response.Status.ToLower()} successfully"));
        }
    }
}
