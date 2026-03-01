using System;
using System.ComponentModel.DataAnnotations;

namespace Aquarium.Application.DTOs.Products
{
    public class ApproveProductRequest
    {
        public string? Note { get; set; }
    }

    public class RejectProductRequest
    {
        [Required]
        [MinLength(10, ErrorMessage = "Rejection reason must be at least 10 characters")]
        public string RejectionReason { get; set; } = string.Empty;
    }

    public record ProductApprovalResponse(
        Guid ProductId,
        string ProductName,
        string Status,
        string? RejectionReason,
        DateTime UpdatedAt
    );
}