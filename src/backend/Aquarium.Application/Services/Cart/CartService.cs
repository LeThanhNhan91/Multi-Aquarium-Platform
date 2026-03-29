using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Cart;
using Aquarium.Application.Interfaces.Cart;
using Aquarium.Application.Interfaces.Products;
using Aquarium.Application.Interfaces.FishInstances;
using Aquarium.Application.Services.Cart;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly IFishInstanceRepository _fishInstanceRepository;
        private readonly CompatibilityChecker _compatibilityChecker;

        public CartService(
            ICartRepository cartRepository,
            IProductRepository productRepository,
            IFishInstanceRepository fishInstanceRepository,
            CompatibilityChecker compatibilityChecker)
        {
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _fishInstanceRepository = fishInstanceRepository;
            _compatibilityChecker = compatibilityChecker;
        }

        public async Task<ApiResponse<IEnumerable<CartItemDto>>> GetCartAsync(Guid userId)
        {
            var items = await _cartRepository.GetByUserIdAsync(userId);
            var dtos = items.Select(MapToDto);
            return new ApiResponse<IEnumerable<CartItemDto>>(dtos, "Cart retrieved successfully");
        }

        public async Task<ApiResponse<AddToCartResponseDto>> AddToCartAsync(Guid userId, AddToCartDto dto)
        {
            var product = await _productRepository.GetByIdAsync(dto.ProductId);
            if (product == null) return new ApiResponse<AddToCartResponseDto>("Product not found");

            // Check if item already exists
            var existing = await _cartRepository.GetByProductAsync(userId, dto.ProductId, dto.FishInstanceId);
            
            CartItem cartItem;
            
            if (existing != null)
            {
                if (product.Type == "LiveFish")
                {
                    // For unique fish, we don't increase quantity in cart
                    // Still run compatibility check for the response
                    var existingItems = await _cartRepository.GetByUserIdAsync(userId);
                    var existingProducts = existingItems
                        .Where(ci => ci.Product != null)
                        .Select(ci => ci.Product)
                        .ToList();
                    var warnings = _compatibilityChecker.Check(product, existingProducts);
                    
                    return new ApiResponse<AddToCartResponseDto>(new AddToCartResponseDto
                    {
                        CartItem = MapToDto(existing),
                        Warnings = warnings
                    }, "Item already in cart");
                }
                
                existing.Quantity += dto.Quantity;
                await _cartRepository.UpdateAsync(existing);
                cartItem = existing;
            }
            else
            {
                var newItem = new CartItem
                {
                    UserId = userId,
                    ProductId = dto.ProductId,
                    FishInstanceId = dto.FishInstanceId,
                    Quantity = product.Type == "LiveFish" ? 1 : dto.Quantity
                };

                await _cartRepository.AddAsync(newItem);
                cartItem = newItem;
            }

            // Reload to get navigation properties
            var reloaded = await _cartRepository.GetByIdAsync(cartItem.Id);
            
            // Run compatibility check
            var allItems = await _cartRepository.GetByUserIdAsync(userId);
            var allProducts = allItems
                .Where(ci => ci.Product != null)
                .Select(ci => ci.Product)
                .ToList();
            var compatibilityWarnings = _compatibilityChecker.Check(product, allProducts);
            
            return new ApiResponse<AddToCartResponseDto>(new AddToCartResponseDto
            {
                CartItem = MapToDto(reloaded ?? cartItem),
                Warnings = compatibilityWarnings
            }, compatibilityWarnings.Count > 0 ? "Added to cart with compatibility warnings" : "Added to cart");
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

        public async Task<ApiResponse<IEnumerable<CompatibilityWarningDto>>> CheckCartCompatibilityAsync(Guid userId)
        {
            var allItems = await _cartRepository.GetByUserIdAsync(userId);
            var allProducts = allItems
                .Where(ci => ci.Product != null && ci.Product.Type == "LiveFish")
                .Select(ci => ci.Product)
                .ToList();

            var allWarnings = new List<CompatibilityWarningDto>();
            var checkedPairs = new HashSet<string>();

            foreach (var product in allProducts)
            {
                var others = allProducts.Where(p => p.Id != product.Id).ToList();
                var warnings = _compatibilityChecker.Check(product, others);
                
                foreach (var w in warnings)
                {
                    // Avoid duplicate warnings (A vs B and B vs A)
                    var pairKey = string.Join("_", new[] { w.ProductId.ToString(), w.ConflictWithProductId.ToString() }.OrderBy(x => x)) + "_" + w.WarningType;
                    if (checkedPairs.Add(pairKey))
                    {
                        allWarnings.Add(w);
                    }
                }
            }

            return new ApiResponse<IEnumerable<CompatibilityWarningDto>>(allWarnings, "Compatibility check completed");
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
