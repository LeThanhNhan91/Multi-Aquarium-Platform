using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Aquarium.Application.DTOs.Inventory
{
    public class UpdateStockRequest
    {
        public string Type { get; set; } = "Import"; // "Import" || "Adjust" || "Export" 

        public int Amount { get; set; }

        public string? Note { get; set; } // reason for adjustment or additional info
    }
}
