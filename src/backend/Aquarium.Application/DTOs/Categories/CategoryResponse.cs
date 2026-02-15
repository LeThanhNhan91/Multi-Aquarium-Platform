using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Categories
{
    public record CategoryResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    int ProductCount
    );
}
