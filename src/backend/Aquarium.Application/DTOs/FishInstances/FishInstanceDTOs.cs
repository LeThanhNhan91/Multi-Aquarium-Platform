using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.DTOs.FishInstances
{
    public record FishInstanceResponse(
        Guid Id,
        Guid ProductId,
        decimal Price,
        string Size,
        string? Color,
        string? Features,
        string? Gender,
        string Status,
        List<string> Images,
        string? VideoUrl,
        DateTime CreatedAt,
        DateTime? SoldAt,
        DateTime? ReservedUntil
    );

    public class CreateFishInstanceRequest
    {
        [Required]
        public decimal Price { get; set; }

        [Required]
        [StringLength(50)]
        public string Size { get; set; }

        [StringLength(100)]
        public string? Color { get; set; }

        [StringLength(500)]
        public string? Features { get; set; }

        [StringLength(20)]
        public string? Gender { get; set; }

        public List<IFormFile>? Images { get; set; }

        public IFormFile? Video { get; set; }
    }

    public class UpdateFishInstanceRequest
    {
        [Required]
        public decimal Price { get; set; }

        [Required]
        [StringLength(50)]
        public string Size { get; set; }

        [StringLength(100)]
        public string? Color { get; set; }

        [StringLength(500)]
        public string? Features { get; set; }

        [StringLength(20)]
        public string? Gender { get; set; }

        [Required]
        [RegularExpression("^(Available|Sold|Reserved|OnHold)$")]
        public string Status { get; set; } = "Available";
    }

    public class AddFishInstanceMediaRequest
    {
        [Required]
        public List<IFormFile> Images { get; set; }
    }

    public class UpdateFishInstanceVideoRequest
    {
        [Required]
        public IFormFile Video { get; set; }
    }
}
