using Aquarium.Application.DTOs.Payments;
using Aquarium.Application.Interfaces.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly string _frontendUrl;

        public PaymentController(IOrderService orderService, IConfiguration configuration)
        {
            _orderService = orderService;
            _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:3000";
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

            // vnp_TxnRef is the orderId we stored when creating the payment URL
            var orderId = Request.Query["vnp_TxnRef"].ToString();

            if (response)
            {
                return Redirect($"{_frontendUrl}/checkout/success?orderId={orderId}");
            }

            return Redirect($"{_frontendUrl}/checkout/failed");
        }
    }
}
