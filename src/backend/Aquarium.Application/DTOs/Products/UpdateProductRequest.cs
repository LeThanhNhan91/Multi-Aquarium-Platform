using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Aquarium.Application.DTOs.Products
{
    public class UpdateProductRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public decimal? BasePrice { get; set; }

        public List<IFormFile>? NewImages { get; set; }
        
        public List<Guid>? RemoveImageIds { get; set; }

        public List<string>? RemoveImageUrls { get; set; }
    }
}
