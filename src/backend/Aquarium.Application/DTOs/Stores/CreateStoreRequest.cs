using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Aquarium.Application.DTOs.Stores
{
    public record CreateStoreRequest(
    [Required] string Name,
    [Required] string Address,
    string? DeliveryArea,
    string? Description
    );
}
