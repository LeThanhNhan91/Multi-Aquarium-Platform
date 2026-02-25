using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.DTOs.Stores
{
    public class CreateStoreRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        public string? DeliveryArea { get; set; }

        public string? Description { get; set; }

        public IFormFile? Logo { get; set; }

        public IFormFile? Cover { get; set; }
    }
}
