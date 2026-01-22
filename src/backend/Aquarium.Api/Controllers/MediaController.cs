using Aquarium.Application.Interfaces.Media;
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
                return BadRequest("Invalid image format. Allowed: jpg, jpeg, png, webp");

            var result = await _mediaService.UploadImageAsync(file);
            return Ok(result);
        }

        [HttpPost("upload-video")]
        public async Task<IActionResult> UploadVideo(IFormFile file)
        {
            var result = await _mediaService.UploadVideoAsync(file);
            return Ok(result);
        }

        [HttpDelete("{publicId}")]
        public async Task<IActionResult> DeleteMedia(string publicId)
        {
            await _mediaService.DeleteMediaAsync(publicId);
            return Ok(new { message = "Deleted successfully" });
        }
    }
}
