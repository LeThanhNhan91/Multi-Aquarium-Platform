using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Products;
using Aquarium.Application.Interfaces;
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

        public ProductService(IProductRepository productRepository, IStoreRepository storeRepository, IStoreContext storeContext, IMediaService mediaService, IInventoryService inventoryService)
        {
            _productRepository = productRepository;
            _storeRepository = storeRepository;
            _storeContext = storeContext;
            _mediaService = mediaService;
            _inventoryService = inventoryService;
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
        private ProductResponse MapToResponse(Product p)
        {
            int totalQuantity = p.Inventory?.Quantity ?? 0;
            int availableToSell = p.Inventory?.AvailableStock ?? 0;

            // Use precomputed rating values
            double averageRating = p.AverageRating;
            int totalReviews = p.TotalReviews;

            return new ProductResponse(
                p.Id,
                p.Name,
                p.Slug,
                p.Description,
                p.BasePrice,
                p.Store?.Name ?? "Unknown Store",
                p.StoreId,
                p.Category?.Name ?? "Uncategorized",
                p.ProductMedia.Select(m => m.MediaUrl).ToList(),
                p.CreatedAt,
                totalQuantity,
                availableToSell,
                averageRating,
                totalReviews
            );
        }

        public async Task<ProductResponse> CreateProductAsync(CreateProductRequest request, Guid userId)
        {
            var currentStoreId = _storeContext.StoreId;

            if (!currentStoreId.HasValue)
            {
                throw new BadRequestException("The store that performed this action is unknown.");
            }

            await EnsureStoreAccessAsync(currentStoreId.Value, userId);

            var product = new Product
            {
                Id = Guid.NewGuid(),
                StoreId = currentStoreId.Value,
                CategoryId = request.CategoryId,
                Name = request.Name,
                Slug = Helper.GenerateSlug(request.Name),
                Description = request.Description,
                BasePrice = request.BasePrice,
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

            await _inventoryService.InitInventoryAsync(product.Id);

            var fullProduct = await _productRepository.GetByIdAsync(product.Id);

            if (fullProduct == null) throw new Exception("Error creating product.");

            return MapToResponse(fullProduct);
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
            return MapToResponse(product);
        }

        public async Task<PagedResult<ProductResponse>> GetProductsAsync(GetProductsFilter filter)
        {
            var pagedData = await _productRepository.GetProductsByFilterAsync(filter);

            var productResponses = pagedData.Items.Select(p => MapToResponse(p)).ToList();

            return new PagedResult<ProductResponse>(
                productResponses,
                pagedData.TotalCount,
                pagedData.PageIndex,
                pagedData.PageSize
            );
        }
    }
}
