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

        public ProductService(
            IProductRepository productRepository, 
            IStoreRepository storeRepository, 
            IStoreContext storeContext, 
            IMediaService mediaService, 
            IInventoryService inventoryService,
            IFishInstanceRepository fishInstanceRepository,
            ICategoryRepository categoryRepository)
        {
            _productRepository = productRepository;
            _storeRepository = storeRepository;
            _storeContext = storeContext;
            _mediaService = mediaService;
            _inventoryService = inventoryService;
            _fishInstanceRepository = fishInstanceRepository;
            _categoryRepository = categoryRepository;
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
        private async Task<ProductResponse> MapToResponseAsync(Product p)
        {
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
                var fishInstances = await _fishInstanceRepository.GetAvailableByProductIdAsync(p.Id);

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
                    fishResponses
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
                    null  // FishInstances
                );
            }
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
                await _inventoryService.InitInventoryAsync(product.Id);
            }

            var fullProduct = await _productRepository.GetByIdAsync(product.Id);

            if (fullProduct == null) throw new Exception("Error creating product.");

            return await MapToResponseAsync(fullProduct);
        }

        public async Task DeleteProductAsync(Guid productId, Guid userId)
        {
            var product = await _productRepository.GetByIdAsync(productId);

            if (product == null)
                throw new NotFoundException("Product", productId);

            await EnsureStoreAccessAsync(product.StoreId, userId);

            if (product.ProductMedia != null)
            {
                foreach (var media in product.ProductMedia)
                {
                    if (!string.IsNullOrEmpty(media.PublicId))
                    {
                        // Fire-and-forget (only await if want 100% sure)
                        await _mediaService.DeleteMediaAsync(media.PublicId);
                    }
                }
            }

            await _productRepository.DeleteAsync(product);
            await _productRepository.SaveChangesAsync();
        }

        public async Task<ProductResponse> GetProductByIdAsync(Guid id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) throw new NotFoundException("Product", id);
            return await MapToResponseAsync(product);
        }

        public async Task<PagedResult<ProductResponse>> GetProductsAsync(GetProductsFilter filter)
        {
            var pagedData = await _productRepository.GetProductsByFilterAsync(filter);

            var productResponses = new List<ProductResponse>();
            foreach (var product in pagedData.Items)
            {
                productResponses.Add(await MapToResponseAsync(product));
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
                productResponses.Add(await MapToResponseAsync(product));
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
