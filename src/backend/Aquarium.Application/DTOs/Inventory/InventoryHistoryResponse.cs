using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Inventory
{
    public record InventoryHistoryResponse(
    Guid Id,
    string ActionType,
    int QuantityChange,
    int RemainingQuantity,
    string? Note,
    DateTime CreatedAt,
    Guid CreatedBy
    );
}
