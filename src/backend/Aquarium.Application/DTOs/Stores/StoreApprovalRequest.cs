using System;
using System.ComponentModel.DataAnnotations;

namespace Aquarium.Application.DTOs.Stores
{
    public class ApproveStoreRequest
    {
        // Optional: Admin can leave approval note
        public string? Note { get; set; }
    }

    public class RejectStoreRequest
    {
        [Required]
        [MinLength(10, ErrorMessage = "Rejection reason must be at least 10 characters")]
        public string RejectionReason { get; set; } = string.Empty;
    }

    public record StoreApprovalResponse(
        Guid StoreId,
        string StoreName,
        string Status,
        string? RejectionReason,
        DateTime UpdatedAt
    );
}
