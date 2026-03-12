using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.DTOs.Doa
{

    public class CreateDoaRequestFormRequest
    {
        [Required]
        public Guid OrderId { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 10)]
        public string Reason { get; set; }

        public List<IFormFile>? Images { get; set; }

        public List<IFormFile>? Videos { get; set; }
    }

    public class DoaMediaItem
    {
        public string Url { get; set; }
        public string PublicId { get; set; }
        public string MediaType { get; set; }    // "Image" | "Video"
    }

    public class CreateDoaRequest
    {
        [Required]
        public Guid OrderId { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 10)]
        public string Reason { get; set; }

        public List<DoaMediaItem>? Media { get; set; }
    }

    public class ReviewDoaRequestRequest
    {
        [Required]
        public string Decision { get; set; }

        [StringLength(500)]
        public string? ReviewNote { get; set; }
    }

    public class GetDoaRequestsFilter
    {
        public string? Status { get; set; }
        public string? SortBy { get; set; }
        public bool IsDescending { get; set; } = true;
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class DoaMediaResponse
    {
        public Guid Id { get; set; }
        public string MediaUrl { get; set; }
        public string MediaType { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class DoaRequestResponse
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; }
        public string? CustomerAvatarUrl { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string? ReviewNote { get; set; }
        public string? ReviewedByName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public List<DoaMediaResponse> Media { get; set; } = new List<DoaMediaResponse>();
    }
}
