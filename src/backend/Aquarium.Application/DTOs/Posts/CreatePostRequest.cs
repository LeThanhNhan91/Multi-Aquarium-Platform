using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.DTOs.Posts
{
    public class CreatePostRequest
    {
        public Guid StoreId { get; set; }
        public string Content { get; set; } = string.Empty;

        public List<IFormFile> MediaFiles { get; set; } = new List<IFormFile>();
    }
}
