using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.DTOs.Posts
{
    public class UpdatePostRequest
    {
        public string Content { get; set; } = string.Empty;

        public List<Guid> MediaIdsToDelete { get; set; } = new List<Guid>();

        public List<IFormFile> NewMediaFiles { get; set; } = new List<IFormFile>();
    }
}
