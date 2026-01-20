using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Aquarium.Application.DTOs.Stores
{
    public class UpdateStoreStatusRequest
    {
        [Required]
        [RegularExpression("Active|Rejected", ErrorMessage = "Status must be 'Active' or 'Rejected'.")]
        public string Status { get; set; } = string.Empty;

        public string? Reason { get; set; }
    }
}
