using Aquarium.Application.Interfaces.Media;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MediaController : ControllerBase
    {
        private readonly IMediaService _mediaService;

        public MediaController(IMediaService mediaService)
        {
            _mediaService = mediaService;
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            // Validate file extension (only for image)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new ApiResponse<object>("Invalid image format. Allowed: jpg, jpeg, png, webp"));

            var result = await _mediaService.UploadImageAsync(file);
            return Ok(new ApiResponse<object>(result, "Image uploaded successfully"));
        }

        [HttpPost("upload-video")]
        public async Task<IActionResult> UploadVideo(IFormFile file)
        {
            var result = await _mediaService.UploadVideoAsync(file);
            return Ok(new ApiResponse<object>(result, "Video uploaded successfully"));
        }

        [HttpDelete("{publicId}")]
        public async Task<IActionResult> DeleteMedia(string publicId)
        {
            await _mediaService.DeleteMediaAsync(publicId);
            return Ok(new ApiResponse<object>(null, "Media deleted successfully"));
        }
    }
}
