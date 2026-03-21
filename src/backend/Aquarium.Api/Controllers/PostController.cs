using System.Security.Claims;
using Aquarium.Application.DTOs.Posts;
using Aquarium.Application.Interfaces.Posts;
using Aquarium.Application.Wrappers;
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

            var result = await _postService.CreatePostAsync(request, userId);

            return CreatedAtAction(
                nameof(CreatePost), 
                new { id = result.Id }, 
                new ApiResponse<PostResponse>(result, "Post created successfully")
            );
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPostById(Guid id)
        {
            Guid currentUserId = Guid.Empty;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null) currentUserId = Guid.Parse(userIdClaim.Value);

            var result = await _postService.GetPostByIdAsync(id, currentUserId);
            return Ok(new ApiResponse<PostFeedDto>(result));
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdatePost(Guid id, [FromForm] UpdatePostRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _postService.UpdatePostAsync(id, request, userId);
            return Ok(new ApiResponse<PostResponse>(result, "Post updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            await _postService.DeletePostAsync(id, userId);
            return Ok(new ApiResponse<object>(null, "Post deleted successfully"));
        }

        // Newsfeed (Infinite Scroll)
        [HttpGet("feed")]
        [AllowAnonymous]
        public async Task<IActionResult> GetNewsFeed([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            Guid currentUserId = Guid.Empty;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null) currentUserId = Guid.Parse(userIdClaim.Value);

            var result = await _postService.GetNewsFeedAsync(page, size, currentUserId);
            return Ok(new ApiResponse<PagedResult<PostFeedDto>>(result));
        }

        // Liked Posts (Saved)
        [HttpGet("liked")]
        public async Task<IActionResult> GetLikedPosts([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _postService.GetLikedPostsAsync(userId, page, size);
            return Ok(new ApiResponse<PagedResult<PostFeedDto>>(result));
        }

        // Like / Unlike (Toggle)
        [HttpPost("{id}/like")]
        public async Task<IActionResult> ToggleLike(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var isLiked = await _postService.ToggleLikeAsync(id, userId);
            return Ok(new ApiResponse<object>(
                new { isLiked }, 
                isLiked ? "Post liked successfully" : "Post unliked successfully"
            ));
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(Guid id, [FromBody] CreateCommentRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _postService.AddCommentAsync(id, request.Content, userId);
            return Ok(new ApiResponse<CommentDto>(result, "Comment added successfully"));
        }

        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetComments(Guid id, [FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var result = await _postService.GetCommentsAsync(id, page, size);
            return Ok(new ApiResponse<PagedResult<CommentDto>>(result));
        }
    }
}
