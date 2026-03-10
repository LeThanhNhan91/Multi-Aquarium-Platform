using System;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Reviews;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Application.Interfaces.Reviews;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IProductRepository _productRepository;
        private readonly IStoreRepository _storeRepository;

        public ReviewService(
            IReviewRepository reviewRepository, 
            IProductRepository productRepository,
            IStoreRepository storeRepository)
        {
            _reviewRepository = reviewRepository;
            _productRepository = productRepository;
            _storeRepository = storeRepository;
        }

        // Product Reviews
        public async Task<ReviewResponse> CreateProductReviewAsync(Guid productId, CreateReviewRequest request, Guid userId)
        {
            // Verify user has purchased this product in this order
            var hasPurchased = await _reviewRepository.HasUserPurchasedProductAsync(userId, productId, request.OrderId);
            if (!hasPurchased)
            {
                throw new BadRequestException("You can only review products you have purchased and received (order must be completed).");
            }

            // Check if user has already reviewed this product for this order
            var existingReview = await _reviewRepository.GetProductReviewByUserAndOrderAsync(productId, userId, request.OrderId);
            if (existingReview != null)
            {
                throw new BadRequestException("You have already reviewed this product for this order.");
            }

            var review = new ProductReview
            {
                Id = Guid.NewGuid(),
                ProductId = productId,
                UserId = userId,
                OrderId = request.OrderId,
                Rating = request.Rating,
                Comment = request.Comment,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddProductReviewAsync(review);
            await _reviewRepository.SaveChangesAsync();

            // Update product rating
            await _productRepository.UpdateProductRatingAsync(productId);
            await _productRepository.SaveChangesAsync();

            // Reload to get navigation properties
            var createdReview = await _reviewRepository.GetProductReviewByIdAsync(review.Id);

            return MapToReviewResponse(createdReview);
        }

        public async Task<ReviewResponse> UpdateProductReviewAsync(Guid productId, Guid reviewId, UpdateReviewRequest request, Guid userId)
        {
            var review = await _reviewRepository.GetProductReviewByIdAsync(reviewId);

            if (review == null)
            {
                throw new NotFoundException("Review", reviewId);
            }

            if (review.ProductId != productId)
            {
                throw new BadRequestException("Review does not belong to this product.");
            }

            if (review.UserId != userId)
            {
                throw new ForbiddenException("You can only edit your own reviews.");
            }

            review.Rating = request.Rating;
            review.Comment = request.Comment;
            review.UpdatedAt = DateTime.UtcNow;

            await _reviewRepository.UpdateProductReviewAsync(review);
            await _reviewRepository.SaveChangesAsync();

            // Update product rating
            await _productRepository.UpdateProductRatingAsync(productId);
            await _productRepository.SaveChangesAsync();

            return MapToReviewResponse(review);
        }

        public async Task DeleteProductReviewAsync(Guid productId, Guid reviewId, Guid userId)
        {
            var review = await _reviewRepository.GetProductReviewByIdAsync(reviewId);

            if (review == null)
            {
                throw new NotFoundException("Review", reviewId);
            }

            if (review.ProductId != productId)
            {
                throw new BadRequestException("Review does not belong to this product.");
            }

            if (review.UserId != userId)
            {
                throw new ForbiddenException("You can only delete your own reviews.");
            }

            await _reviewRepository.DeleteProductReviewAsync(review);
            await _reviewRepository.SaveChangesAsync();

            // Update product rating
            await _productRepository.UpdateProductRatingAsync(productId);
            await _productRepository.SaveChangesAsync();
        }

        public async Task<PagedResult<ReviewResponse>> GetProductReviewsAsync(Guid productId, GetReviewsFilter filter)
        {
            var pagedReviews = await _reviewRepository.GetProductReviewsAsync(productId, filter);

            var reviewResponses = pagedReviews.Items.Select(r => MapToReviewResponse(r)).ToList();

            return new PagedResult<ReviewResponse>(
                reviewResponses,
                pagedReviews.TotalCount,
                pagedReviews.PageIndex,
                pagedReviews.PageSize
            );
        }

        public async Task<ReviewSummary> GetProductReviewSummaryAsync(Guid productId)
        {
            return await _reviewRepository.GetProductReviewSummaryAsync(productId);
        }

        public async Task<CanReviewResponse> CanReviewProductAsync(Guid productId, Guid userId)
        {
            var orderId = await _reviewRepository.GetEligibleOrderIdForReviewAsync(userId, productId);

            if (orderId == null)
            {
                return new CanReviewResponse
                {
                    CanReview = false,
                    Message = "You can only review products you have purchased and received (order must be completed and not already reviewed)."
                };
            }

            return new CanReviewResponse
            {
                CanReview = true,
                OrderId = orderId.Value,
                Message = "You can review this product."
            };
        }

        // Store Reviews
        public async Task<ReviewResponse> CreateStoreReviewAsync(Guid storeId, CreateReviewRequest request, Guid userId)
        {
            // Verify user has purchased from this store in this order
            var hasPurchased = await _reviewRepository.HasUserPurchasedFromStoreAsync(userId, storeId, request.OrderId);
            if (!hasPurchased)
            {
                throw new BadRequestException("You can only review stores you have purchased from (order must be completed).");
            }

            // Check if user has already reviewed this store for this order
            var existingReview = await _reviewRepository.GetStoreReviewByUserAndOrderAsync(storeId, userId, request.OrderId);
            if (existingReview != null)
            {
                throw new BadRequestException("You have already reviewed this store for this order.");
            }

            var review = new StoreReview
            {
                Id = Guid.NewGuid(),
                StoreId = storeId,
                UserId = userId,
                OrderId = request.OrderId,
                Rating = request.Rating,
                Comment = request.Comment,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddStoreReviewAsync(review);
            await _reviewRepository.SaveChangesAsync();

            await _storeRepository.UpdateStoreRatingAsync(storeId);
            await _storeRepository.SaveChangesAsync();

            // Reload to get navigation properties
            var createdReview = await _reviewRepository.GetStoreReviewByIdAsync(review.Id);

            return MapToStoreReviewResponse(createdReview);
        }

        public async Task<ReviewResponse> UpdateStoreReviewAsync(Guid storeId, Guid reviewId, UpdateReviewRequest request, Guid userId)
        {
            var review = await _reviewRepository.GetStoreReviewByIdAsync(reviewId);

            if (review == null)
            {
                throw new NotFoundException("Review", reviewId);
            }

            if (review.StoreId != storeId)
            {
                throw new BadRequestException("Review does not belong to this store.");
            }

            if (review.UserId != userId)
            {
                throw new ForbiddenException("You can only edit your own reviews.");
            }

            review.Rating = request.Rating;
            review.Comment = request.Comment;
            review.UpdatedAt = DateTime.UtcNow;

            await _reviewRepository.UpdateStoreReviewAsync(review);
            await _reviewRepository.SaveChangesAsync();

            await _storeRepository.UpdateStoreRatingAsync(storeId);
            await _storeRepository.SaveChangesAsync();

            return MapToStoreReviewResponse(review);
        }

        public async Task DeleteStoreReviewAsync(Guid storeId, Guid reviewId, Guid userId)
        {
            var review = await _reviewRepository.GetStoreReviewByIdAsync(reviewId);

            if (review == null)
            {
                throw new NotFoundException("Review", reviewId);
            }

            if (review.StoreId != storeId)
            {
                throw new BadRequestException("Review does not belong to this store.");
            }

            if (review.UserId != userId)
            {
                throw new ForbiddenException("You can only delete your own reviews.");
            }

            await _reviewRepository.DeleteStoreReviewAsync(review);
            await _reviewRepository.SaveChangesAsync();

            await _storeRepository.UpdateStoreRatingAsync(storeId);
            await _storeRepository.SaveChangesAsync();
        }

        public async Task<PagedResult<ReviewResponse>> GetStoreReviewsAsync(Guid storeId, GetReviewsFilter filter)
        {
            var pagedReviews = await _reviewRepository.GetStoreReviewsAsync(storeId, filter);

            var reviewResponses = pagedReviews.Items.Select(r => MapToStoreReviewResponse(r)).ToList();

            return new PagedResult<ReviewResponse>(
                reviewResponses,
                pagedReviews.TotalCount,
                pagedReviews.PageIndex,
                pagedReviews.PageSize
            );
        }

        public async Task<ReviewSummary> GetStoreReviewSummaryAsync(Guid storeId)
        {
            return await _reviewRepository.GetStoreReviewSummaryAsync(storeId);
        }

        // Helper methods
        private ReviewResponse MapToReviewResponse(ProductReview review)
        {
            return new ReviewResponse
            {
                Id = review.Id,
                ProductId = review.ProductId,
                StoreId = null,
                UserId = review.UserId,
                UserName = review.User?.FullName ?? "Unknown User",
                UserAvatarUrl = review.User?.AvatarUrl,
                OrderId = review.OrderId,
                Rating = review.Rating,
                Comment = review.Comment,
                Status = review.Status,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            };
        }

        private ReviewResponse MapToStoreReviewResponse(StoreReview review)
        {
            return new ReviewResponse
            {
                Id = review.Id,
                ProductId = Guid.Empty,
                StoreId = review.StoreId,
                UserId = review.UserId,
                UserName = review.User?.FullName ?? "Unknown User",
                UserAvatarUrl = review.User?.AvatarUrl,
                OrderId = review.OrderId,
                Rating = review.Rating,
                Comment = review.Comment,
                Status = review.Status,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            };
        }
    }
}
