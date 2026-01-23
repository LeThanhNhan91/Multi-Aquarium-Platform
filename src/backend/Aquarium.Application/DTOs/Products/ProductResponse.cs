using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Products
{
    public record ProductResponse(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    decimal BasePrice,
    string StoreName,
    Guid StoreId,
    string CategoryName,
    List<string> Images,
    DateTime CreatedAt,
    int Quantity,
    int AvailableStock
    );
}
