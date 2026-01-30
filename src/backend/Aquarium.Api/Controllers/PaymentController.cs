using Aquarium.Application.DTOs.Payments;
using Aquarium.Application.Interfaces.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public PaymentController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("create-url")]
        [Authorize]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] PaymentRequest request)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            var userId = Guid.Parse(userIdClaim.Value);

            var url = await _orderService.CreatePaymentUrlAsync(request.OrderId, userId, HttpContext);

            return Ok(new PaymentLinkDto { PaymentUrl = url });
        }

        [HttpGet("vnpay-return")]
        [AllowAnonymous] 
        public async Task<IActionResult> VnPayReturn()
        {
            var response = await _orderService.HandlePaymentCallbackAsync(Request.Query);

            if (response)
            {
                // redirect to a Frontend "Thank You" page (IMPLEMENT LATER)
                // Example: return Redirect($"http://localhost:3000/checkout/success");
                return Ok(new { message = "Payment Successful!" });
            }

            // Redirect to Frontend "Failed" page
            return BadRequest(new { message = "Payment Failed." });
        }
    }
}
