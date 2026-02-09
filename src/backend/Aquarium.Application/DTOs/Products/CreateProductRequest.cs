using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.DTOs.Products
{
    public class CreateProductRequest
    {
        [Required]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal BasePrice { get; set; }

        [Required]
        public Guid CategoryId { get; set; }

        public List<IFormFile>? Images { get; set; }
    }
}
