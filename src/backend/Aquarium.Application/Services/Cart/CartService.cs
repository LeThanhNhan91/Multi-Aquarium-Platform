using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Cart;
using Aquarium.Application.Interfaces.Cart;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Application.Interfaces.FishInstances;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly IFishInstanceRepository _fishInstanceRepository;

        public CartService(
            ICartRepository cartRepository,
            IProductRepository productRepository,
            IFishInstanceRepository fishInstanceRepository)
        {
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _fishInstanceRepository = fishInstanceRepository;
        }

        public async Task<ApiResponse<IEnumerable<CartItemDto>>> GetCartAsync(Guid userId)
        {
            var items = await _cartRepository.GetByUserIdAsync(userId);
            var dtos = items.Select(MapToDto);
            return new ApiResponse<IEnumerable<CartItemDto>>(dtos, "Cart retrieved successfully");
        }

        public async Task<ApiResponse<CartItemDto>> AddToCartAsync(Guid userId, AddToCartDto dto)
        {
            var product = await _productRepository.GetByIdAsync(dto.ProductId);
            if (product == null) return new ApiResponse<CartItemDto>("Product not found");

            // Check if item already exists
            var existing = await _cartRepository.GetByProductAsync(userId, dto.ProductId, dto.FishInstanceId);
            
            if (existing != null)
            {
                if (product.Type == "LiveFish")
                {
                    // For unique fish, we don't increase quantity in cart
                    return new ApiResponse<CartItemDto>(MapToDto(existing), "Item already in cart");
                }
                
                existing.Quantity += dto.Quantity;
                await _cartRepository.UpdateAsync(existing);
                return new ApiResponse<CartItemDto>(MapToDto(existing), "Quantity updated");
            }

            var newItem = new CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                FishInstanceId = dto.FishInstanceId,
                Quantity = product.Type == "LiveFish" ? 1 : dto.Quantity
            };

            await _cartRepository.AddAsync(newItem);
            
            // Reload to get navigation properties
            var reloaded = await _cartRepository.GetByIdAsync(newItem.Id);
            return new ApiResponse<CartItemDto>(MapToDto(newItem), "Added to cart");
        }

        public async Task<ApiResponse<CartItemDto>> UpdateQuantityAsync(Guid userId, Guid cartItemId, int quantity)
        {
            var item = await _cartRepository.GetByIdAsync(cartItemId);
            if (item == null || item.UserId != userId) return new ApiResponse<CartItemDto>("Item not found");

            // Check if it's a LiveFish
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product != null && product.Type == "LiveFish")
            {
                return new ApiResponse<CartItemDto>("Cannot update quantity for unique fish");
            }

            item.Quantity = Math.Max(1, quantity);
            await _cartRepository.UpdateAsync(item);
            
            return new ApiResponse<CartItemDto>(MapToDto(item), "Quantity updated");
        }

        public async Task<ApiResponse<bool>> RemoveFromCartAsync(Guid userId, Guid cartItemId)
        {
            var item = await _cartRepository.GetByIdAsync(cartItemId);
            if (item == null || item.UserId != userId) return new ApiResponse<bool>("Item not found");

            await _cartRepository.DeleteAsync(item);
            return new ApiResponse<bool>(true, "Item removed");
        }

        public async Task<ApiResponse<bool>> ClearCartAsync(Guid userId)
        {
            await _cartRepository.ClearAsync(userId);
            return new ApiResponse<bool>(true, "Cart cleared");
        }

        public async Task<ApiResponse<bool>> MergeCartAsync(Guid userId, IEnumerable<AddToCartDto> guestItems)
        {
            foreach (var guestItem in guestItems)
            {
                await AddToCartAsync(userId, guestItem);
            }
            return new ApiResponse<bool>(true, "Cart merged successfully");
        }

        private CartItemDto MapToDto(CartItem item)
        {
            return new CartItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                FishInstanceId = item.FishInstanceId,
                ProductName = item.Product?.Name ?? "Unknown Product",
                ProductType = item.Product?.Type ?? "Unknown",
                Price = item.FishInstanceId.HasValue 
                    ? (item.FishInstance?.Price ?? item.Product?.BasePrice ?? 0)
                    : (item.Product?.BasePrice ?? 0),
                Quantity = item.Quantity,
                ImageUrl = item.FishInstanceId.HasValue
                    ? (item.FishInstance?.FishInstanceMedia?.FirstOrDefault()?.MediaUrl ?? item.Product?.ProductMedia?.FirstOrDefault()?.MediaUrl)
                    : item.Product?.ProductMedia?.FirstOrDefault()?.MediaUrl,
                StoreId = item.Product?.StoreId ?? Guid.Empty,
                StoreName = item.Product?.Store?.Name ?? "Unknown Store"
            };
        }
    }
}
