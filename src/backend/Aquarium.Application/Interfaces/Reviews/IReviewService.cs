using System;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Reviews;
using Aquarium.Application.Wrappers;

namespace Aquarium.Application.Interfaces.Reviews
{
    public interface IReviewService
    {
        // Product Reviews
        Task<ReviewResponse> CreateProductReviewAsync(Guid productId, CreateReviewRequest request, Guid userId);
        Task<ReviewResponse> UpdateProductReviewAsync(Guid productId, Guid reviewId, UpdateReviewRequest request, Guid userId);
        Task DeleteProductReviewAsync(Guid productId, Guid reviewId, Guid userId);
        Task<PagedResult<ReviewResponse>> GetProductReviewsAsync(Guid productId, GetReviewsFilter filter);
        Task<ReviewSummary> GetProductReviewSummaryAsync(Guid productId);
        Task<CanReviewResponse> CanReviewProductAsync(Guid productId, Guid userId);
        Task<ReviewResponse?> GetProductReviewByOrderAsync(Guid productId, Guid orderId, Guid userId);
        Task<IEnumerable<ReviewResponse>> GetOrderReviewsAsync(Guid orderId, Guid userId);

        // Store Reviews
        Task<ReviewResponse> CreateStoreReviewAsync(Guid storeId, CreateReviewRequest request, Guid userId);
        Task<ReviewResponse> UpdateStoreReviewAsync(Guid storeId, Guid reviewId, UpdateReviewRequest request, Guid userId);
        Task DeleteStoreReviewAsync(Guid storeId, Guid reviewId, Guid userId);
        Task<PagedResult<ReviewResponse>> GetStoreReviewsAsync(Guid storeId, GetReviewsFilter filter);
        Task<ReviewSummary> GetStoreReviewSummaryAsync(Guid storeId);
        Task<ReviewResponse?> GetStoreReviewByOrderAsync(Guid storeId, Guid orderId, Guid userId);
        Task<IEnumerable<StoreBadgeResponse>> GetStoreBadgesAsync(Guid storeId);
    }
}
