using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Categories
{
    public record CategoryTreeResponse(
    Guid Id,
    string Name,
    string Slug,
    List<CategoryTreeResponse> Children // Contains a recursive sublist.
    );
}
