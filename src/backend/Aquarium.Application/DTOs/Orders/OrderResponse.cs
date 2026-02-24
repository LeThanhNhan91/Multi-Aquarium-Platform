using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Orders
{
    public record OrderResponse(
        Guid Id,
        Guid StoreId,
        string StoreName,
        decimal TotalAmount,
        string Status,
        string ShippingAddress,
        DateTime CreatedAt,
        List<OrderItemResponse> Items
    );
}
