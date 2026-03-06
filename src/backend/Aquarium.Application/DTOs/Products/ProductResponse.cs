using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.FishInstances;

namespace Aquarium.Application.DTOs.Products
{
    public record ProductResponse(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    string ProductType,
    decimal? BasePrice,
    string StoreName,
    Guid StoreId,
    string CategoryName,
    List<string> Images,
    DateTime CreatedAt,
    int? Quantity,
    int? AvailableStock,
    double AverageRating,
    int TotalReviews,
    int? AvailableFishCount,
    decimal? MinPrice,
    decimal? MaxPrice,
    List<FishInstanceResponse>? FishInstances,
    bool IsOwner = false
    );
}
