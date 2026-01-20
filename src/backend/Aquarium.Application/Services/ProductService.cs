using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Products;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Application.Interfaces.Store;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IStoreRepository _storeRepository;
        private readonly IStoreContext _storeContext;

        public ProductService(IProductRepository productRepository, IStoreRepository storeRepository, IStoreContext storeContext)
        {
            _productRepository = productRepository;
            _storeRepository = storeRepository;
            _storeContext = storeContext;
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
                p.CreatedAt
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

            // Handle Image (Mapping list string -> ProductMedia entities)
            if (request.ImageUrls != null)
            {
                foreach (var url in request.ImageUrls)
                {
                    product.ProductMedia.Add(new ProductMedia
                    {
                        Id = Guid.NewGuid(),
                        MediaUrl = url,
                        MediaType = "Image",
                        IsPrimary = false // Logic set cover image will be implemented later
                    });
                }
            }

            await _productRepository.AddAsync(product);
            await _productRepository.SaveChangesAsync();

            return MapToResponse(product);
        }

        public async Task DeleteProductAsync(Guid productId, Guid userId)
        {
            var product = await _productRepository.GetByIdAsync(productId);

            if (product == null)
                throw new NotFoundException("Product", productId);

            await EnsureStoreAccessAsync(product.StoreId, userId);

            await _productRepository.DeleteAsync(product);
            await _productRepository.SaveChangesAsync();
        }

        public async Task<ProductResponse> GetProductByIdAsync(Guid id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) throw new NotFoundException("Product", id);
            return MapToResponse(product);
        }

        public async Task<List<ProductResponse>> GetProductsAsync(GetProductsFilter filter)
        {
            var products = await _productRepository.GetProductsByFilterAsync(filter);
            return products.Select(MapToResponse).ToList();
        }
    }
}
