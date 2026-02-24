using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Orders
{
    public record OrderItemResponse(
        Guid ProductId,
        Guid? FishInstanceId,
        string ProductName,
        decimal PriceAtPurchase,
        int Quantity,
        decimal TotalLineAmount,
        string? ProductImageUrl,
        List<string>? FishImages,
        string? FishVideoUrl
    );

    public record OrderDetailResponse(
        Guid Id,
        Guid StoreId,
        string StoreName,
        string CustomerName,
        decimal TotalAmount,
        string Status,
        string ShippingAddress,
        string? Note,
        DateTime CreatedAt,
        List<OrderItemResponse> Items
    );
}
