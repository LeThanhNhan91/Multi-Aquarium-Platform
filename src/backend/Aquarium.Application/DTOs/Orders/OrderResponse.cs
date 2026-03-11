using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Orders
{
    public record OrderResponse(
        Guid Id,
        Guid StoreId,
        string StoreName,
        Guid CustomerId,
        string CustomerName,
        decimal TotalAmount,
        string Status,
        string PaymentStatus,
        string ShippingAddress,
        string? Note,
        DateTime CreatedAt,
        List<OrderItemResponse> Items,
        bool IsReviewed = false
    );
}
