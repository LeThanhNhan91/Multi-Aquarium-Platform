using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Cart;
using Aquarium.Application.Wrappers;

namespace Aquarium.Application.Interfaces.Cart
{
    public interface ICartService
    {
        Task<ApiResponse<IEnumerable<CartItemDto>>> GetCartAsync(Guid userId);
        Task<ApiResponse<CartItemDto>> AddToCartAsync(Guid userId, AddToCartDto dto);
        Task<ApiResponse<CartItemDto>> UpdateQuantityAsync(Guid userId, Guid cartItemId, int quantity);
        Task<ApiResponse<bool>> RemoveFromCartAsync(Guid userId, Guid cartItemId);
        Task<ApiResponse<bool>> ClearCartAsync(Guid userId);
        Task<ApiResponse<bool>> MergeCartAsync(Guid userId, IEnumerable<AddToCartDto> guestItems);
    }
}
