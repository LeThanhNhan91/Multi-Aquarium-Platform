using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Reviews;
using Aquarium.Application.Interfaces.Reviews;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdClaim.Value);
        }

        // Product Reviews
        [HttpPost("products/{productId}/reviews")]
        [Authorize]
        public async Task<IActionResult> CreateProductReview(Guid productId, [FromBody] CreateReviewRequest request)
        {
            var userId = GetCurrentUserId();
            var review = await _reviewService.CreateProductReviewAsync(productId, request, userId);
            return Ok(new ApiResponse<ReviewResponse>(review, "Product review created successfully"));
        }

        [HttpPut("products/{productId}/reviews/{reviewId}")]
        [Authorize]
        public async Task<IActionResult> UpdateProductReview(Guid productId, Guid reviewId, [FromBody] UpdateReviewRequest request)
        {
            var userId = GetCurrentUserId();
            var review = await _reviewService.UpdateProductReviewAsync(productId, reviewId, request, userId);
            return Ok(new ApiResponse<ReviewResponse>(review, "Product review updated successfully"));
        }

        [HttpDelete("products/{productId}/reviews/{reviewId}")]
        [Authorize]
        public async Task<IActionResult> DeleteProductReview(Guid productId, Guid reviewId)
        {
            var userId = GetCurrentUserId();
            await _reviewService.DeleteProductReviewAsync(productId, reviewId, userId);
            return Ok(new ApiResponse<object>(null, "Product review deleted successfully"));
        }

        [HttpGet("products/{productId}/reviews")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductReviews(Guid productId, [FromQuery] GetReviewsFilter filter)
        {
            var reviews = await _reviewService.GetProductReviewsAsync(productId, filter);
            return Ok(new ApiResponse<PagedResult<ReviewResponse>>(reviews));
        }

        [HttpGet("products/{productId}/reviews/summary")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductReviewSummary(Guid productId)
        {
            var summary = await _reviewService.GetProductReviewSummaryAsync(productId);
            return Ok(new ApiResponse<ReviewSummary>(summary));
        }

        [HttpGet("products/{productId}/can-review")]
        [Authorize]
        public async Task<IActionResult> CanReviewProduct(Guid productId)
        {
            var userId = GetCurrentUserId();
            var result = await _reviewService.CanReviewProductAsync(productId, userId);
            return Ok(new ApiResponse<CanReviewResponse>(result));
        }

        // Store Reviews
        [HttpPost("stores/{storeId}/reviews")]
        [Authorize]
        public async Task<IActionResult> CreateStoreReview(Guid storeId, [FromBody] CreateReviewRequest request)
        {
            var userId = GetCurrentUserId();
            var review = await _reviewService.CreateStoreReviewAsync(storeId, request, userId);
            return Ok(new ApiResponse<ReviewResponse>(review, "Store review created successfully"));
        }

        [HttpPut("stores/{storeId}/reviews/{reviewId}")]
        [Authorize]
        public async Task<IActionResult> UpdateStoreReview(Guid storeId, Guid reviewId, [FromBody] UpdateReviewRequest request)
        {
            var userId = GetCurrentUserId();
            var review = await _reviewService.UpdateStoreReviewAsync(storeId, reviewId, request, userId);
            return Ok(new ApiResponse<ReviewResponse>(review, "Store review updated successfully"));
        }

        [HttpDelete("stores/{storeId}/reviews/{reviewId}")]
        [Authorize]
        public async Task<IActionResult> DeleteStoreReview(Guid storeId, Guid reviewId)
        {
            var userId = GetCurrentUserId();
            await _reviewService.DeleteStoreReviewAsync(storeId, reviewId, userId);
            return Ok(new ApiResponse<object>(null, "Store review deleted successfully"));
        }

        [HttpGet("stores/{storeId}/reviews")]
        [AllowAnonymous]
        public async Task<IActionResult> GetStoreReviews(Guid storeId, [FromQuery] GetReviewsFilter filter)
        {
            var reviews = await _reviewService.GetStoreReviewsAsync(storeId, filter);
            return Ok(new ApiResponse<PagedResult<ReviewResponse>>(reviews));
        }

        [HttpGet("stores/{storeId}/reviews/summary")]
        [AllowAnonymous]
        public async Task<IActionResult> GetStoreReviewSummary(Guid storeId)
        {
            var summary = await _reviewService.GetStoreReviewSummaryAsync(storeId);
            return Ok(new ApiResponse<ReviewSummary>(summary));
        }
    }
}
