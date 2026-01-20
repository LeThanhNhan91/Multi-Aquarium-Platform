using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Stores
{
    public record StoreResponse(
    Guid Id,
    string Name,
    string Slug,
    string Status,
    string Role
    );
}
