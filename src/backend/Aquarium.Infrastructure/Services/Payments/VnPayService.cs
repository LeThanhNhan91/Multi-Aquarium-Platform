using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Payments;
using Aquarium.Application.Interfaces.Payments;
using Aquarium.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Aquarium.Infrastructure.Services.Payments
{
    public class VnPayService : IPaymentGateway
    {
        private readonly IConfiguration _configuration;

        public VnPayService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string CreatePaymentUrl(Order order, HttpContext httpContext)
        {
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);

            //if (timeNow.Year > 2025)
            //{
            //    timeNow = timeNow.AddYears(-1);
            //}

            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VnPayLibrary();

            var urlCallBack = _configuration["VnPay:CallbackUrl"];

            pay.AddRequestData("vnp_Version", _configuration["VnPay:Version"]);
            pay.AddRequestData("vnp_Command", _configuration["VnPay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _configuration["VnPay:TmnCode"]);

            // Amount must be multiplied by 100 (VNPay rule)
            // Example: 10,000 VND -> 1,000,000
            pay.AddRequestData("vnp_Amount", ((long)order.TotalAmount * 100).ToString());

            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _configuration["VnPay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", GetIpAddress(httpContext));
            pay.AddRequestData("vnp_Locale", _configuration["VnPay:Locale"]);

            // Use OrderId + Ticks to ensure uniqueness if user retries payment
            pay.AddRequestData("vnp_OrderInfo", $"Pay for order {order.Id}");
            pay.AddRequestData("vnp_OrderType", "other");
            pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
            pay.AddRequestData("vnp_TxnRef", order.Id.ToString()); // Order ID

            var paymentUrl = pay.CreateRequestUrl(_configuration["VnPay:BaseUrl"], _configuration["VnPay:HashSecret"]);

            return paymentUrl;
        }

        public PaymentReturnDto ProcessPaymentReturn(IQueryCollection collections)
        {
            var pay = new VnPayLibrary();

            // Populate response data
            foreach (var (key, value) in collections)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    pay.AddResponseData(key, value);
                }
            }

            var vnp_OrderInfo = pay.GetResponseData("vnp_OrderInfo");
            var vnp_SecureHash = collections.FirstOrDefault(k => k.Key == "vnp_SecureHash").Value;
            var vnp_ResponseCode = pay.GetResponseData("vnp_ResponseCode");
            var vnp_TxnRef = pay.GetResponseData("vnp_TxnRef");
            var vnp_TransactionNo = pay.GetResponseData("vnp_TransactionNo");

            bool checkSignature = pay.ValidateSignature(vnp_SecureHash, _configuration["VnPay:HashSecret"]);

            if (!checkSignature)
            {
                return new PaymentReturnDto { IsSuccess = false, Message = "Invalid Signature" };
            }

            // vnp_ResponseCode = "00" means Success
            if (vnp_ResponseCode == "00")
            {
                return new PaymentReturnDto
                {
                    IsSuccess = true,
                    Message = "Success",
                    OrderId = vnp_TxnRef,
                    TransactionId = vnp_TransactionNo
                };
            }

            return new PaymentReturnDto
            {
                IsSuccess = false,
                Message = $"Error Code: {vnp_ResponseCode}",
                OrderId = vnp_TxnRef
            };
        }

        // Helper to get Client IP
        private string GetIpAddress(HttpContext context)
        {
            var ipAddress = string.Empty;
            try
            {
                var remoteIpAddress = context.Connection.RemoteIpAddress;
                if (remoteIpAddress != null)
                {
                    if (remoteIpAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
                    {
                        remoteIpAddress = System.Net.Dns.GetHostEntry(remoteIpAddress).AddressList
                            .FirstOrDefault(x => x.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
                    }
                    if (remoteIpAddress != null) ipAddress = remoteIpAddress.ToString();
                    return ipAddress;
                }
            }
            catch (Exception ex)
            {
                return "Invalid IP: " + ex.Message;
            }
            return "127.0.0.1";
        }
    }
}
