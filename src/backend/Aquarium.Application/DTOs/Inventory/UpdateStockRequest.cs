using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Aquarium.Application.DTOs.Inventory
{
    public class UpdateStockRequest
    {
        [Required]
        public string Type { get; set; } = "Import"; // "Import" || "Adjust" || "Export" 

        [Range(1, int.MaxValue)]
        public int Amount { get; set; }

        public string? Note { get; set; } // reason for adjustment or additional info
    }
}
