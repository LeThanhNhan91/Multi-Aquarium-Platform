using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Inventory
{
    public record InventoryResponse(
    Guid ProductId,
    int Quantity,
    int ReservedQuantity,
    int AvailableStock,
    DateTime LastUpdated
    );
}
