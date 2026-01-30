using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Payments
{
    public class PaymentLinkDto
    {
        public string PaymentUrl { get; set; } = string.Empty;
    }

    public class PaymentReturnDto
    {
        public string? PaymentId { get; set; }
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public string? OrderId { get; set; }
        public decimal Amount { get; set; }
    }
}
