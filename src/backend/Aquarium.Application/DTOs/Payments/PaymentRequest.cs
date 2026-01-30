using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Aquarium.Application.DTOs.Payments
{
    public class PaymentRequest
    {
        [Required]
        public Guid OrderId { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = "VNPay"; 
    }

    public class PaymentResult
    {
        public bool IsSuccess { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
