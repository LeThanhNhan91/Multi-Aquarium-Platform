using System.Security.Claims;
using Aquarium.Application.DTOs.Orders;
using Aquarium.Application.Interfaces.Orders;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdClaim.Value);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var userId = GetCurrentUserId();
            var response = await _orderService.GetOrderByIdAsync(id, userId);
            return Ok(new ApiResponse<OrderDetailResponse>(response));
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetOrders([FromQuery] GetOrdersFilter filter)
        {
            var userId = GetCurrentUserId();
            var response = await _orderService.GetOrdersAsync(filter, userId);
            return Ok(new ApiResponse<PagedResult<OrderResponse>>(response));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var userId = GetCurrentUserId();
            var response = await _orderService.CreateOrderAsync(request, userId);

            return CreatedAtAction(
                nameof(GetOrderById), 
                new { id = response.Id }, 
                new ApiResponse<OrderResponse>(response, "Order created successfully")
            );
        }

        [HttpPatch("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
        {
            var userId = GetCurrentUserId();
            await _orderService.UpdateOrderStatusAsync(id, request, userId);
            return Ok(new ApiResponse<string>("Order status updated successfully"));
        }
    }
}
