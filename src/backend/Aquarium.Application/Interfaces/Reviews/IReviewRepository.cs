using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Reviews;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Reviews
{
    public interface IReviewRepository
    {
        // Product Reviews
        Task<ProductReview?> GetProductReviewByIdAsync(Guid reviewId);
        Task<ProductReview?> GetProductReviewByUserAndOrderAsync(Guid productId, Guid userId, Guid orderId);
        Task<List<ProductReview>> GetProductReviewsByOrderAsync(Guid orderId, Guid userId);
        Task<List<ProductReview>> GetProductReviewsByOrderIdsAsync(List<Guid> orderIds, Guid userId);
        Task<PagedResult<ProductReview>> GetProductReviewsAsync(Guid productId, GetReviewsFilter filter);
        Task<ReviewSummary> GetProductReviewSummaryAsync(Guid productId);
        Task AddProductReviewAsync(ProductReview review);
        Task UpdateProductReviewAsync(ProductReview review);
        Task DeleteProductReviewAsync(ProductReview review);

        // Store Reviews
        Task<StoreReview?> GetStoreReviewByIdAsync(Guid reviewId);
        Task<StoreReview?> GetStoreReviewByUserAndOrderAsync(Guid storeId, Guid userId, Guid orderId);
        Task<PagedResult<StoreReview>> GetStoreReviewsAsync(Guid storeId, GetReviewsFilter filter);
        Task<ReviewSummary> GetStoreReviewSummaryAsync(Guid storeId);
        Task AddStoreReviewAsync(StoreReview review);
        Task UpdateStoreReviewAsync(StoreReview review);
        Task DeleteStoreReviewAsync(StoreReview review);

        // Media
        Task AddProductReviewMediaAsync(IEnumerable<ProductReviewMedia> media);
        Task AddStoreReviewMediaAsync(IEnumerable<StoreReviewMedia> media);
        Task DeleteProductReviewMediaByReviewIdAsync(Guid reviewId);
        Task DeleteStoreReviewMediaByReviewIdAsync(Guid reviewId);

        // Order verification
        Task<bool> HasUserPurchasedProductAsync(Guid userId, Guid productId, Guid orderId);
        Task<bool> HasUserPurchasedFromStoreAsync(Guid userId, Guid storeId, Guid orderId);
        Task<Guid?> GetEligibleOrderIdForReviewAsync(Guid userId, Guid productId);

        Task<bool> SaveChangesAsync();
    }
}
