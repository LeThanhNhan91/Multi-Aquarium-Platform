using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Reviews;
using Aquarium.Application.Interfaces.Reviews;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public ReviewRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        // Product Reviews
        public async Task<ProductReview?> GetProductReviewByIdAsync(Guid reviewId)
        {
            return await _context.ProductReviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .Include(r => r.Media)
                .FirstOrDefaultAsync(r => r.Id == reviewId);
        }

        public async Task<ProductReview?> GetProductReviewByUserAndOrderAsync(Guid productId, Guid userId, Guid orderId)
        {
            return await _context.ProductReviews
                .FirstOrDefaultAsync(r => r.ProductId == productId && r.UserId == userId && r.OrderId == orderId);
        }

        public async Task<List<ProductReview>> GetProductReviewsByOrderAsync(Guid orderId, Guid userId)
        {
            return await _context.ProductReviews
                .Include(r => r.User)
                .Where(r => r.OrderId == orderId && r.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<ProductReview>> GetProductReviewsByOrderIdsAsync(List<Guid> orderIds, Guid userId)
        {
            return await _context.ProductReviews
                .Where(r => orderIds.Contains(r.OrderId) && r.UserId == userId)
                .ToListAsync();
        }

        public async Task<PagedResult<ProductReview>> GetProductReviewsAsync(Guid productId, GetReviewsFilter filter)
        {
            var query = _context.ProductReviews
                .Include(r => r.User)
                .Include(r => r.Media)
                .Where(r => r.ProductId == productId && r.Status == "Active");

            if (filter.Rating.HasValue)
            {
                query = query.Where(r => r.Rating == filter.Rating.Value);
            }

            query = filter.SortBy?.ToLower() switch
            {
                "rating" => filter.IsDescending
                    ? query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt)
                    : query.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                _ => filter.IsDescending
                    ? query.OrderByDescending(r => r.CreatedAt)
                    : query.OrderBy(r => r.CreatedAt)
            };

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<ProductReview>(items, totalCount, filter.PageIndex, filter.PageSize);
        }

        public async Task<ReviewSummary> GetProductReviewSummaryAsync(Guid productId)
        {
            var reviews = await _context.ProductReviews
                .Where(r => r.ProductId == productId && r.Status == "Active")
                .ToListAsync();

            if (!reviews.Any())
            {
                return new ReviewSummary();
            }

            return new ReviewSummary
            {
                AverageRating = reviews.Average(r => r.Rating),
                TotalReviews = reviews.Count,
                FiveStarCount = reviews.Count(r => r.Rating == 5),
                FourStarCount = reviews.Count(r => r.Rating == 4),
                ThreeStarCount = reviews.Count(r => r.Rating == 3),
                TwoStarCount = reviews.Count(r => r.Rating == 2),
                OneStarCount = reviews.Count(r => r.Rating == 1)
            };
        }

        public async Task AddProductReviewAsync(ProductReview review)
        {
            await _context.ProductReviews.AddAsync(review);
        }

        public async Task UpdateProductReviewAsync(ProductReview review)
        {
            _context.ProductReviews.Update(review);
            await Task.CompletedTask;
        }

        public async Task DeleteProductReviewAsync(ProductReview review)
        {
            _context.ProductReviews.Remove(review);
            await Task.CompletedTask;
        }

        // Store Reviews
        public async Task<StoreReview?> GetStoreReviewByIdAsync(Guid reviewId)
        {
            return await _context.StoreReviews
                .Include(r => r.User)
                .Include(r => r.Store)
                .Include(r => r.Media)
                .FirstOrDefaultAsync(r => r.Id == reviewId);
        }

        public async Task<StoreReview?> GetStoreReviewByUserAndOrderAsync(Guid storeId, Guid userId, Guid orderId)
        {
            return await _context.StoreReviews
                .FirstOrDefaultAsync(r => r.StoreId == storeId && r.UserId == userId && r.OrderId == orderId);
        }

        public async Task<PagedResult<StoreReview>> GetStoreReviewsAsync(Guid storeId, GetReviewsFilter filter)
        {
            var query = _context.StoreReviews
                .Include(r => r.User)
                .Include(r => r.Media)
                .Where(r => r.StoreId == storeId && r.Status == "Active");

            if (filter.Rating.HasValue)
            {
                query = query.Where(r => r.Rating == filter.Rating.Value);
            }

            query = filter.SortBy?.ToLower() switch
            {
                "rating" => filter.IsDescending
                    ? query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt)
                    : query.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                _ => filter.IsDescending
                    ? query.OrderByDescending(r => r.CreatedAt)
                    : query.OrderBy(r => r.CreatedAt)
            };

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<StoreReview>(items, totalCount, filter.PageIndex, filter.PageSize);
        }

        public async Task<ReviewSummary> GetStoreReviewSummaryAsync(Guid storeId)
        {
            var reviews = await _context.StoreReviews
                .Where(r => r.StoreId == storeId && r.Status == "Active")
                .ToListAsync();

            if (!reviews.Any())
            {
                return new ReviewSummary();
            }

            return new ReviewSummary
            {
                AverageRating = reviews.Average(r => r.Rating),
                TotalReviews = reviews.Count,
                FiveStarCount = reviews.Count(r => r.Rating == 5),
                FourStarCount = reviews.Count(r => r.Rating == 4),
                ThreeStarCount = reviews.Count(r => r.Rating == 3),
                TwoStarCount = reviews.Count(r => r.Rating == 2),
                OneStarCount = reviews.Count(r => r.Rating == 1)
            };
        }

        public async Task AddStoreReviewAsync(StoreReview review)
        {
            await _context.StoreReviews.AddAsync(review);
        }

        public async Task UpdateStoreReviewAsync(StoreReview review)
        {
            _context.StoreReviews.Update(review);
            await Task.CompletedTask;
        }

        public async Task DeleteStoreReviewAsync(StoreReview review)
        {
            _context.StoreReviews.Remove(review);
            await Task.CompletedTask;
        }

        // Order verification
        public async Task<bool> HasUserPurchasedProductAsync(Guid userId, Guid productId, Guid orderId)
        {
            return await _context.OrderItems
                .AnyAsync(oi => oi.Order.CustomerId == userId 
                    && oi.ProductId == productId 
                    && oi.OrderId == orderId
                    && oi.Order.Status == "Completed");
        }

        public async Task<bool> HasUserPurchasedFromStoreAsync(Guid userId, Guid storeId, Guid orderId)
        {
            return await _context.Orders
                .AnyAsync(o => o.CustomerId == userId 
                    && o.Id == orderId 
                    && o.StoreId == storeId
                    && o.Status == "Completed");
        }

        public async Task<Guid?> GetEligibleOrderIdForReviewAsync(Guid userId, Guid productId)
        {
            var eligibleOrder = await _context.OrderItems
                .Where(oi => oi.Order.CustomerId == userId 
                    && oi.ProductId == productId 
                    && oi.Order.Status == "Completed")
                .Select(oi => oi.OrderId)
                .FirstOrDefaultAsync();

            if (eligibleOrder == Guid.Empty) return null;

            var alreadyReviewed = await _context.ProductReviews
                .AnyAsync(r => r.UserId == userId && r.ProductId == productId && r.OrderId == eligibleOrder);

            return alreadyReviewed ? null : eligibleOrder;
        }

        // Media
        public async Task AddProductReviewMediaAsync(IEnumerable<ProductReviewMedia> media)
        {
            await _context.ProductReviewMedias.AddRangeAsync(media);
        }

        public async Task AddStoreReviewMediaAsync(IEnumerable<StoreReviewMedia> media)
        {
            await _context.StoreReviewMedias.AddRangeAsync(media);
        }

        public async Task DeleteProductReviewMediaByReviewIdAsync(Guid reviewId)
        {
            var mediaItems = await _context.ProductReviewMedias
                .Where(m => m.ProductReviewId == reviewId)
                .ToListAsync();
            _context.ProductReviewMedias.RemoveRange(mediaItems);
        }

        public async Task DeleteStoreReviewMediaByReviewIdAsync(Guid reviewId)
        {
            var mediaItems = await _context.StoreReviewMedias
                .Where(m => m.StoreReviewId == reviewId)
                .ToListAsync();
            _context.StoreReviewMedias.RemoveRange(mediaItems);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
