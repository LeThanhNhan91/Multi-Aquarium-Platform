using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Cart;
using Aquarium.Application.Interfaces.Cart;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();
            var response = await _cartService.GetCartAsync(userId);
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            var userId = GetUserId();
            var response = await _cartService.AddToCartAsync(userId, dto);
            return Ok(response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuantity(Guid id, [FromBody] UpdateCartItemDto dto)
        {
            var userId = GetUserId();
            var response = await _cartService.UpdateQuantityAsync(userId, id, dto.Quantity);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFromCart(Guid id)
        {
            var userId = GetUserId();
            var response = await _cartService.RemoveFromCartAsync(userId, id);
            return Ok(response);
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            var response = await _cartService.ClearCartAsync(userId);
            return Ok(response);
        }

        [HttpPost("merge")]
        public async Task<IActionResult> MergeCart([FromBody] IEnumerable<AddToCartDto> guestItems)
        {
            var userId = GetUserId();
            var response = await _cartService.MergeCartAsync(userId, guestItems);
            return Ok(response);
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException("User not authenticated");
            return Guid.Parse(userIdClaim.Value);
        }
    }
}
