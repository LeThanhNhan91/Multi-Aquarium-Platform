using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.DTOs.Users
{
    public record UserDTOs
    (
        Guid Id,
        string Email,
        string FullName,
        string PhoneNumber,
        string Role,
        string Status,
        string? AvatarUrl,
        string? CoverUrl
    );

    public class GetUsersFilter
    {
        public string? Keyword { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public string? SortBy { get; set; }
        public bool IsDescending { get; set; } = false;
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class UpdateUserRequest
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public IFormFile? Avatar { get; set; }
        public IFormFile? Cover { get; set; }
    }
}
