using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.FishInstances;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Categories;
using Aquarium.Application.Interfaces.FishInstances;
using Aquarium.Application.Interfaces.Media;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.Services
{
    public class FishInstanceService : IFishInstanceService
    {
        private readonly IFishInstanceRepository _fishInstanceRepository;
        private readonly IProductRepository _productRepository;
        private readonly IStoreRepository _storeRepository;
        private readonly IMediaService _mediaService;
        private readonly ICategoryRepository _categoryRepository;

        public FishInstanceService(
            IFishInstanceRepository fishInstanceRepository,
            IProductRepository productRepository,
            IStoreRepository storeRepository,
            IMediaService mediaService,
            ICategoryRepository categoryRepository)
        {
            _fishInstanceRepository = fishInstanceRepository;
            _productRepository = productRepository;
            _storeRepository = storeRepository;
            _mediaService = mediaService;
            _categoryRepository = categoryRepository;
        }

        public async Task<FishInstanceResponse> CreateFishInstanceAsync(Guid productId, CreateFishInstanceRequest request, Guid userId)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
            {
                throw new NotFoundException("Product", productId);
            }

            // Check if product is LiveFish based on root category
            var rootCategory = await _categoryRepository.GetRootCategoryAsync(product.CategoryId);
            string baseSlug = Helper.GetBaseSlug(rootCategory?.Slug ?? "");
            bool isLiveFish = baseSlug == "ca-canh";

            if (!isLiveFish)
            {
                throw new BadRequestException("Fish instances can only be added to LiveFish products (products under 'Cá c?nh' category)");
            }

            // Verify user has permission to manage this product's store
            await EnsureStoreAccessAsync(product.StoreId, userId);

            var fishInstance = new FishInstance
            {
                Id = Guid.NewGuid(),
                ProductId = productId,
                Price = request.Price,
                Size = request.Size,
                Color = request.Color ?? string.Empty,
                Features = request.Features ?? string.Empty,
                Gender = request.Gender ?? "Unknown",
                Status = "Available",
                CreatedAt = DateTime.UtcNow
            };

            // Upload video if provided
            if (request.Video is not null)
            {
                var videoResult = await _mediaService.UploadVideoAsync(request.Video);
                fishInstance.VideoUrl = videoResult.Url;
                fishInstance.VideoPublicId = videoResult.PublicId;
            }

            await _fishInstanceRepository.AddAsync(fishInstance);
            await _fishInstanceRepository.SaveChangesAsync();

            // Upload images if provided
            if (request.Images != null && request.Images.Any())
            {
                int order = 0;
                foreach (var image in request.Images)
                {
                    var imageResult = await _mediaService.UploadImageAsync(image);
                    var media = new FishInstanceMedia
                    {
                        Id = Guid.NewGuid(),
                        FishInstanceId = fishInstance.Id,
                        MediaUrl = imageResult.Url,
                        PublicId = imageResult.PublicId,
                        MediaType = "Image",
                        IsPrimary = order == 0,
                        DisplayOrder = order,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _fishInstanceRepository.AddMediaAsync(media);
                    order++;
                }

                await _fishInstanceRepository.SaveChangesAsync();
            }

            // Reload to get media
            var createdFish = await _fishInstanceRepository.GetByIdAsync(fishInstance.Id);
            return MapToResponse(createdFish);
        }

        public async Task<FishInstanceResponse> UpdateFishInstanceAsync(Guid productId, Guid fishInstanceId, UpdateFishInstanceRequest request, Guid userId)
        {
            var fishInstance = await _fishInstanceRepository.GetByIdAsync(fishInstanceId);
            if (fishInstance == null)
            {
                throw new NotFoundException("Fish Instance", fishInstanceId);
            }

            if (fishInstance.ProductId != productId)
            {
                throw new BadRequestException("Fish instance does not belong to this product");
            }

            await EnsureStoreAccessAsync(fishInstance.Product.StoreId, userId);

            fishInstance.Price = request.Price;
            fishInstance.Size = request.Size;
            fishInstance.Color = request.Color ?? string.Empty;
            fishInstance.Features = request.Features ?? string.Empty;
            fishInstance.Gender = request.Gender ?? "Unknown";
            fishInstance.Status = request.Status;

            if (request.Status == "Sold" && !fishInstance.SoldAt.HasValue)
            {
                fishInstance.SoldAt = DateTime.UtcNow;
            }

            await _fishInstanceRepository.UpdateAsync(fishInstance);
            await _fishInstanceRepository.SaveChangesAsync();

            return MapToResponse(fishInstance);
        }

        public async Task DeleteFishInstanceAsync(Guid productId, Guid fishInstanceId, Guid userId)
        {
            var fishInstance = await _fishInstanceRepository.GetByIdAsync(fishInstanceId);
            if (fishInstance == null)
            {
                throw new NotFoundException("Fish Instance", fishInstanceId);
            }

            if (fishInstance.ProductId != productId)
            {
                throw new BadRequestException("Fish instance does not belong to this product");
            }

            await EnsureStoreAccessAsync(fishInstance.Product.StoreId, userId);

            // Delete media from cloud
            if (!string.IsNullOrEmpty(fishInstance.VideoPublicId))
            {
                await _mediaService.DeleteMediaAsync(fishInstance.VideoPublicId);
            }

            foreach (var media in fishInstance.FishInstanceMedia)
            {
                await _mediaService.DeleteMediaAsync(media.PublicId);
                await _fishInstanceRepository.DeleteMediaAsync(media);
            }

            await _fishInstanceRepository.DeleteAsync(fishInstance);
            await _fishInstanceRepository.SaveChangesAsync();
        }

        public async Task<List<FishInstanceResponse>> GetFishInstancesByProductIdAsync(Guid productId)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
            {
                throw new NotFoundException("Product", productId);
            }

            var fishInstances = await _fishInstanceRepository.GetByProductIdAsync(productId);
            return fishInstances.Select(f => MapToResponse(f)).ToList();
        }

        public async Task<FishInstanceResponse> GetFishInstanceByIdAsync(Guid productId, Guid fishInstanceId)
        {
            var fishInstance = await _fishInstanceRepository.GetByIdAsync(fishInstanceId);
            if (fishInstance == null)
            {
                throw new NotFoundException("Fish Instance", fishInstanceId);
            }

            if (fishInstance.ProductId != productId)
            {
                throw new BadRequestException("Fish instance does not belong to this product");
            }

            return MapToResponse(fishInstance);
        }

        public async Task AddFishInstanceMediaAsync(Guid productId, Guid fishInstanceId, AddFishInstanceMediaRequest request, Guid userId)
        {
            var fishInstance = await _fishInstanceRepository.GetByIdAsync(fishInstanceId);
            if (fishInstance == null)
            {
                throw new NotFoundException("Fish Instance", fishInstanceId);
            }

            if (fishInstance.ProductId != productId)
            {
                throw new BadRequestException("Fish instance does not belong to this product");
            }

            await EnsureStoreAccessAsync(fishInstance.Product.StoreId, userId);

            var existingMedia = await _fishInstanceRepository.GetMediaByFishInstanceIdAsync(fishInstanceId);
            int startOrder = existingMedia.Any() ? existingMedia.Max(m => m.DisplayOrder) + 1 : 0;

            foreach (var image in request.Images)
            {
                var imageResult = await _mediaService.UploadImageAsync(image);
                var media = new FishInstanceMedia
                {
                    Id = Guid.NewGuid(),
                    FishInstanceId = fishInstanceId,
                    MediaUrl = imageResult.Url,
                    PublicId = imageResult.PublicId,
                    MediaType = "Image",
                    IsPrimary = !existingMedia.Any() && startOrder == 0,
                    DisplayOrder = startOrder,
                    CreatedAt = DateTime.UtcNow
                };

                await _fishInstanceRepository.AddMediaAsync(media);
                startOrder++;
            }

            await _fishInstanceRepository.SaveChangesAsync();
        }

        public async Task UpdateFishInstanceVideoAsync(Guid productId, Guid fishInstanceId, UpdateFishInstanceVideoRequest request, Guid userId)
        {
            var fishInstance = await _fishInstanceRepository.GetByIdAsync(fishInstanceId);
            if (fishInstance == null)
            {
                throw new NotFoundException("Fish Instance", fishInstanceId);
            }

            if (fishInstance.ProductId != productId)
            {
                throw new BadRequestException("Fish instance does not belong to this product");
            }

            await EnsureStoreAccessAsync(fishInstance.Product.StoreId, userId);

            // Delete old video
            if (!string.IsNullOrEmpty(fishInstance.VideoPublicId))
            {
                await _mediaService.DeleteMediaAsync(fishInstance.VideoPublicId);
            }

            // Upload new video
            var videoResult = await _mediaService.UploadVideoAsync(request.Video);
            fishInstance.VideoUrl = videoResult.Url;
            fishInstance.VideoPublicId = videoResult.PublicId;

            await _fishInstanceRepository.UpdateAsync(fishInstance);
            await _fishInstanceRepository.SaveChangesAsync();
        }

        public async Task DeleteFishInstanceMediaAsync(Guid productId, Guid fishInstanceId, Guid mediaId, Guid userId)
        {
            var fishInstance = await _fishInstanceRepository.GetByIdAsync(fishInstanceId);
            if (fishInstance == null)
            {
                throw new NotFoundException("Fish Instance", fishInstanceId);
            }

            if (fishInstance.ProductId != productId)
            {
                throw new BadRequestException("Fish instance does not belong to this product");
            }

            await EnsureStoreAccessAsync(fishInstance.Product.StoreId, userId);

            var media = fishInstance.FishInstanceMedia.FirstOrDefault(m => m.Id == mediaId);
            if (media == null)
            {
                throw new NotFoundException("Media", mediaId);
            }

            await _mediaService.DeleteMediaAsync(media.PublicId);
            await _fishInstanceRepository.DeleteMediaAsync(media);
            await _fishInstanceRepository.SaveChangesAsync();
        }

        private async Task EnsureStoreAccessAsync(Guid storeId, Guid userId)
        {
            var member = await _storeRepository.GetStoreUserAsync(storeId, userId);

            if (member == null || (member.Role != "Owner" && member.Role != "Manager"))
            {
                throw new ForbiddenException("You do not have permission to manage fish instances for this store");
            }
        }

        private FishInstanceResponse MapToResponse(FishInstance fish)
        {
            return new FishInstanceResponse(
                fish.Id,
                fish.ProductId,
                fish.Price,
                fish.Size,
                fish.Color,
                fish.Features,
                fish.Gender,
                fish.Status,
                fish.FishInstanceMedia
                    .OrderBy(m => m.DisplayOrder)
                    .Select(m => m.MediaUrl)
                    .ToList(),
                fish.VideoUrl,
                fish.CreatedAt,
                fish.SoldAt,
                fish.ReservedUntil
            );
        }
    }
}
