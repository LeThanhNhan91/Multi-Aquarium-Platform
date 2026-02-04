using System.Security.Claims;
using Aquarium.Application.DTOs.Posts;
using Aquarium.Application.Interfaces.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostController(IPostService postService)
        {
            _postService = postService;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreatePost([FromForm] CreatePostRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            try
            {
                var result = await _postService.CreatePostAsync(request, userId);

                return CreatedAtAction(nameof(CreatePost), new { id = result.Id }, result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdatePost(Guid id, [FromForm] UpdatePostRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            try
            {
                var result = await _postService.UpdatePostAsync(id, request, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException) { return NotFound(); }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            try
            {
                await _postService.DeletePostAsync(id, userId);
                return Ok(new { message = "Delete Post Successfully." });
            }
            catch (KeyNotFoundException) { return NotFound(); }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        // Newsfeed (Infinite Scroll)
        [HttpGet("feed")]
        public async Task<IActionResult> GetNewsFeed([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _postService.GetNewsFeedAsync(page, size, userId);
            return Ok(result);
        }

        // Like / Unlike (Toggle)
        [HttpPost("{id}/like")]
        public async Task<IActionResult> ToggleLike(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var isLiked = await _postService.ToggleLikeAsync(id, userId);
            return Ok(new { isLiked, message = isLiked ? "Liked" : "Unliked" });
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(Guid id, [FromBody] CreateCommentRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _postService.AddCommentAsync(id, request.Content, userId);
            return Ok(result);
        }

        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetComments(Guid id, [FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var result = await _postService.GetCommentsAsync(id, page, size);
            return Ok(result);
        }
    }
}
