using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.FishInstances;
using Aquarium.Application.DTOs.Products;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Categories;
using Aquarium.Application.Interfaces.FishInstances;
using Aquarium.Application.Interfaces.Inventory;
using Aquarium.Application.Interfaces.Media;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Application.Interfaces.Store;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IStoreRepository _storeRepository;
        private readonly IStoreContext _storeContext;
        private readonly IMediaService _mediaService;
        private readonly IInventoryService _inventoryService;
        private readonly IFishInstanceRepository _fishInstanceRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IInventoryRepository _inventoryRepository;

        public ProductService(
            IProductRepository productRepository, 
            IStoreRepository storeRepository, 
            IStoreContext storeContext, 
            IMediaService mediaService, 
            IInventoryService inventoryService,
            IFishInstanceRepository fishInstanceRepository,
            ICategoryRepository categoryRepository,
            IInventoryRepository inventoryRepository)
        {
            _productRepository = productRepository;
            _storeRepository = storeRepository;
            _storeContext = storeContext;
            _mediaService = mediaService;
            _inventoryService = inventoryService;
            _fishInstanceRepository = fishInstanceRepository;
            _categoryRepository = categoryRepository;
            _inventoryRepository = inventoryRepository;
        }

        //Author Helper
        private async Task EnsureStoreAccessAsync (Guid storeId, Guid userId)
        {
            var member = await _storeRepository.GetStoreUserAsync(storeId, userId);

            if (member == null || (member.Role != "Owner" && member.Role != "Manager"))
            {
                throw new ForbiddenException("You do not have permission to manage products for this store.");
            }
        }

        // Helper Mapping
        private async Task<ProductResponse> MapToResponseAsync(Product p, Guid? currentUserId = null)
        {
            // Check if current user is owner of the store
            bool isOwner = false;
            if (currentUserId.HasValue)
            {
                var storeOwnId = await _storeRepository.GetStoreIdByUserIdAsync(currentUserId.Value);
                isOwner = p.StoreId == storeOwnId;
            }

            // Use precomputed rating values
            double averageRating = p.AverageRating;
            int totalReviews = p.TotalReviews;

            // Determine product type based on root category
            var rootCategory = await _categoryRepository.GetRootCategoryAsync(p.CategoryId);
            string baseSlug = Helper.GetBaseSlug(rootCategory?.Slug ?? "");
            bool isLiveFish = baseSlug == "ca-canh";

            if (isLiveFish)
            {
                // For LiveFish products
                var availableFishCount = await _fishInstanceRepository.GetAvailableCountByProductIdAsync(p.Id);
                var priceRange = await _fishInstanceRepository.GetPriceRangeByProductIdAsync(p.Id);
                var fishInstances = await _fishInstanceRepository.GetByProductIdAsync(p.Id);

                var fishResponses = fishInstances.Select(f => new FishInstanceResponse(
                    f.Id,
                    f.ProductId,
                    f.Price,
                    f.Size,
                    f.Color,
                    f.Features,
                    f.Gender,
                    f.Status,
                    f.FishInstanceMedia.OrderBy(m => m.DisplayOrder).Select(m => m.MediaUrl).ToList(),
                    f.VideoUrl,
                    f.CreatedAt,
                    f.SoldAt,
                    f.ReservedUntil
                )).ToList();

                return new ProductResponse(
                    p.Id,
                    p.Name,
                    p.Slug,
                    p.Description,
                    "LiveFish", // ProductType
                    null, // BasePrice
                    p.Store?.Name ?? "Unknown Store",
                    p.StoreId,
                    p.CategoryId,
                    p.Category?.Name ?? "Uncategorized",
                    p.ProductMedia.Select(m => m.MediaUrl).ToList(),
                    p.CreatedAt,
                    null, // Quantity
                    null, // AvailableStock
                    averageRating,
                    totalReviews,
                    availableFishCount,
                    priceRange.min,
                    priceRange.max,
                    fishResponses,
                    isOwner
                );
            }
            else
            {
                // For Equipment products
                int totalQuantity = p.Inventory?.Quantity ?? 0;
                int availableToSell = p.Inventory?.AvailableStock ?? 0;

                return new ProductResponse(
                    p.Id,
                    p.Name,
                    p.Slug,
                    p.Description,
                    "Equipment", // ProductType
                    p.BasePrice,
                    p.Store?.Name ?? "Unknown Store",
                    p.StoreId,
                    p.CategoryId,
                    p.Category?.Name ?? "Uncategorized",
                    p.ProductMedia.Select(m => m.MediaUrl).ToList(),
                    p.CreatedAt,
                    totalQuantity,
                    availableToSell,
                    averageRating,
                    totalReviews,
                    null, // AvailableFishCount
                    null, // MinPrice
                    null, // MaxPrice
                    null,  // FishInstances
                    isOwner
                );
            }
        }

        public async Task<ProductResponse> UpdateProductAsync(Guid productId, UpdateProductRequest request, Guid userId)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
                throw new NotFoundException("Product", productId);

            await EnsureStoreAccessAsync(product.StoreId, userId);

            // Determine product type based on existing category
            var rootCategory = await _categoryRepository.GetRootCategoryAsync(product.CategoryId);
            string baseSlug = Helper.GetBaseSlug(rootCategory?.Slug ?? "");
            bool isLiveFish = baseSlug == "ca-canh";

            if (isLiveFish)
            {
                if (request.BasePrice.HasValue && request.BasePrice.Value > 0)
                {
                    throw new BadRequestException("Sản phẩm Cá Cảnh không có giá cơ bản. Giá được xác định theo từng cá thể.");
                }
                product.BasePrice = 0;
            }
            else
            {
                if (!request.BasePrice.HasValue || request.BasePrice.Value <= 0)
                {
                    throw new BadRequestException("Sản phẩm thiết bị/phụ kiện phải có giá lớn hơn 0.");
                }
                product.BasePrice = request.BasePrice.Value;
            }

            product.Name = request.Name;
            product.Slug = Helper.GenerateSlug(request.Name);
            product.Description = request.Description;

            // Handle Image Removal by ID
            if (request.RemoveImageIds != null && request.RemoveImageIds.Any())
            {
                var mediaToRemove = product.ProductMedia
                    .Where(m => request.RemoveImageIds.Contains(m.Id))
                    .ToList();

                foreach (var media in mediaToRemove)
                {
                    if (!string.IsNullOrEmpty(media.PublicId))
                    {
                        await _mediaService.DeleteMediaAsync(media.PublicId);
                    }
                    product.ProductMedia.Remove(media);
                }
            }

            // Handle Image Removal by URL
            if (request.RemoveImageUrls != null && request.RemoveImageUrls.Any())
            {
                var mediaToRemove = product.ProductMedia
                    .Where(m => request.RemoveImageUrls.Contains(m.MediaUrl))
                    .ToList();

                foreach (var media in mediaToRemove)
                {
                    if (!string.IsNullOrEmpty(media.PublicId))
                    {
                        await _mediaService.DeleteMediaAsync(media.PublicId);
                    }
                    product.ProductMedia.Remove(media);
                }
            }

            // Handle New Images
            if (request.NewImages != null && request.NewImages.Any())
            {
                // If there are no primary images left, make the first new one primary
                bool hasPrimary = product.ProductMedia.Any(m => m.IsPrimary == true);
                
                foreach (var imageFile in request.NewImages)
                {
                    var uploadResult = await _mediaService.UploadImageAsync(imageFile);
                    
                    product.ProductMedia.Add(new ProductMedia
                    {
                        Id = Guid.NewGuid(),
                        MediaUrl = uploadResult.Url,
                        PublicId = uploadResult.PublicId,
                        MediaType = "Image",
                        IsPrimary = !hasPrimary
                    });
                    
                    hasPrimary = true;
                }
            }

            await _productRepository.UpdateAsync(product);
            await _productRepository.SaveChangesAsync();

            var updatedProduct = await _productRepository.GetByIdAsync(product.Id);
            return await MapToResponseAsync(updatedProduct!, userId);
        }

        public async Task<ProductResponse> CreateProductAsync(CreateProductRequest request, Guid userId)
        {
            var currentStoreId = _storeContext.StoreId;

            if (!currentStoreId.HasValue)
            {
                throw new BadRequestException("The store that performed this action is unknown.");
            }

            await EnsureStoreAccessAsync(currentStoreId.Value, userId);

            // Ensure the selected category is a leaf node (has no sub-categories)
            var hasSubCategories = await _categoryRepository.HasSubCategoriesAsync(request.CategoryId);
            if (hasSubCategories)
            {
                throw new BadRequestException("Sản phẩm chỉ có thể được thêm vào danh mục cấp cuối cùng.");
            }

            // Determine product type based on category
            var rootCategory = await _categoryRepository.GetRootCategoryAsync(request.CategoryId);
            string baseSlug = Helper.GetBaseSlug(rootCategory?.Slug ?? "");
            bool isLiveFish = baseSlug == "ca-canh";

            if (isLiveFish)
            {
                if (request.BasePrice.HasValue)
                {
                    throw new BadRequestException("LiveFish products should not have a base price. Price is determined by individual fish instances.");
                }
            }
            else
            {
                if (!request.BasePrice.HasValue || request.BasePrice.Value <= 0)
                {
                    throw new BadRequestException("Equipment products must have a base price greater than 0.");
                }
            }

            var product = new Product
            {
                Id = Guid.NewGuid(),
                StoreId = currentStoreId.Value,
                CategoryId = request.CategoryId,
                Name = request.Name,
                Slug = Helper.GenerateSlug(request.Name),
                Description = request.Description,
                BasePrice = request.BasePrice ?? 0, // Set to 0 for LiveFish, actual value for Equipment
                Status = "Active",
                Type = "Physical",
                CreatedAt = DateTime.UtcNow
            };

            // Handle Image (Upload files and create ProductMedia entities)
            if (request.Images != null && request.Images.Any())
            {
                bool isFirst = true;
                foreach (var imageFile in request.Images)
                {
                    var uploadResult = await _mediaService.UploadImageAsync(imageFile);
                    
                    product.ProductMedia.Add(new ProductMedia
                    {
                        Id = Guid.NewGuid(),
                        MediaUrl = uploadResult.Url,
                        PublicId = uploadResult.PublicId,
                        MediaType = "Image",
                        IsPrimary = isFirst
                    });
                    
                    isFirst = false;
                }
            }

            await _productRepository.AddAsync(product);
            await _productRepository.SaveChangesAsync();

            // Only init inventory for Equipment products
            if (!isLiveFish)
            {
                await _inventoryService.InitInventoryAsync(product.Id, request.Stock ?? 0, userId);
            }

            var fullProduct = await _productRepository.GetByIdAsync(product.Id);

            if (fullProduct == null) throw new Exception("Error creating product.");

            return await MapToResponseAsync(fullProduct, userId);
        }

        public async Task DeleteProductAsync(Guid productId, Guid userId)
        {
            var product = await _productRepository.GetByIdAsync(productId);

            if (product == null)
                throw new NotFoundException("Product", productId);

            await EnsureStoreAccessAsync(product.StoreId, userId);

            // Check if product has any orders
            if (product.OrderItems != null && product.OrderItems.Any())
            {
                throw new BadRequestException("Không thể xóa sản phẩm đã có đơn hàng. Bạn nên chuyển trạng thái sản phẩm sang ngưng kinh doanh thay vì xóa.");
            }

            if (product.ProductMedia != null)
            {
                foreach (var media in product.ProductMedia)
                {
                    if (!string.IsNullOrEmpty(media.PublicId))
                    {
                        await _mediaService.DeleteMediaAsync(media.PublicId);
                    }
                }
            }

            // Delete FishInstance media and videos from Cloudinary
            if (product.FishInstances != null)
            {
                foreach (var fish in product.FishInstances)
                {
                    // Delete images
                    foreach (var media in fish.FishInstanceMedia)
                    {
                        if (!string.IsNullOrEmpty(media.PublicId))
                        {
                            await _mediaService.DeleteMediaAsync(media.PublicId);
                        }
                    }

                    // Delete video
                    if (!string.IsNullOrEmpty(fish.VideoPublicId))
                    {
                        await _mediaService.DeleteMediaAsync(fish.VideoPublicId);
                    }
                }
            }

            // Handle related entities that might block deletion
            if (product.Inventory != null)
            {
                await _inventoryRepository.DeleteAsync(product.Inventory);
            }

            await _productRepository.DeleteAsync(product);
            await _productRepository.SaveChangesAsync();
        }

        public async Task<ProductResponse> GetProductByIdAsync(Guid id, Guid? userId = null)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) throw new NotFoundException("Product", id);
            return await MapToResponseAsync(product, userId);
        }

        public async Task<PagedResult<ProductResponse>> GetProductsAsync(GetProductsFilter filter, Guid? userId = null)
        {
            if (userId.HasValue && !filter.ExcludedStoreId.HasValue)
            {
                filter.ExcludedStoreId = await _storeRepository.GetStoreIdByUserIdAsync(userId.Value);
            }

            var pagedData = await _productRepository.GetProductsByFilterAsync(filter);

            var productResponses = new List<ProductResponse>();
            foreach (var product in pagedData.Items)
            {
                productResponses.Add(await MapToResponseAsync(product, userId));
            }

            return new PagedResult<ProductResponse>(
                productResponses,
                pagedData.TotalCount,
                pagedData.PageIndex,
                pagedData.PageSize
            );
        }

        public async Task<PagedResult<ProductResponse>> GetMyStoreProductsAsync(Guid storeId, Guid userId, GetProductsFilter filter)
        {
            // Authorization check: Only Owner/Manager of the store can access
            await EnsureStoreAccessAsync(storeId, userId);

            // Force the filter to use the specified storeId
            filter.StoreId = storeId;

            var pagedData = await _productRepository.GetProductsByFilterAsync(filter);

            var productResponses = new List<ProductResponse>();
            foreach (var product in pagedData.Items)
            {
                productResponses.Add(await MapToResponseAsync(product, userId));
            }

            return new PagedResult<ProductResponse>(
                productResponses,
                pagedData.TotalCount,
                pagedData.PageIndex,
                pagedData.PageSize
            );
        }

        public async Task<ProductApprovalResponse> ApproveProductAsync(Guid productId, Guid adminUserId, ApproveProductRequest request)
        {
            var product = await _productRepository.GetByIdAsync(productId);

            if (product == null)
            {
                throw new NotFoundException("Product", productId);
            }

            if (product.Status == "Approved")
            {
                throw new BadRequestException("Product is already approved.");
            }

            product.Status = "Approved";
            product.RejectionReason = null; // Clear rejection reason if any

            await _productRepository.UpdateAsync(product);
            await _productRepository.SaveChangesAsync();

            return new ProductApprovalResponse(
                product.Id,
                product.Name,
                product.Status,
                product.RejectionReason,
                DateTime.UtcNow
            );
        }

        public async Task<ProductApprovalResponse> RejectProductAsync(Guid productId, Guid adminUserId, RejectProductRequest request)
        {
            var product = await _productRepository.GetByIdAsync(productId);

            if (product == null)
            {
                throw new NotFoundException("Product", productId);
            }

            if (product.Status == "Rejected")
            {
                throw new BadRequestException("Product is already rejected.");
            }

            product.Status = "Rejected";
            product.RejectionReason = request.RejectionReason;

            await _productRepository.UpdateAsync(product);
            await _productRepository.SaveChangesAsync();

            return new ProductApprovalResponse(
                product.Id,
                product.Name,
                product.Status,
                product.RejectionReason,
                DateTime.UtcNow
            );
        }
    }
}
