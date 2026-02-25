using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.DTOs.Stores
{
    public class UpdateStoreLogoRequest
    {
        [Required]
        public IFormFile Logo { get; set; } = null!;
    }

    public class UpdateStoreCoverRequest
    {
        [Required]
        public IFormFile Cover { get; set; } = null!;
    }

    public record UpdateStoreMediaResponse(
        Guid StoreId,
        string StoreName,
        string? LogoUrl,
        string? CoverUrl
    );
}
