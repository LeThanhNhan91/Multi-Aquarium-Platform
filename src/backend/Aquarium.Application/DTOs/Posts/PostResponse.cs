using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Posts
{
    public class PostResponse
    {
        public Guid Id { get; set; }
        public Guid StoreId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<PostMediaDto> Media { get; set; } = new List<PostMediaDto>();
    }

    public class PostMediaDto
    {
        public Guid Id { get; set; }
        public string Url { get; set; }
        public string Type { get; set; }
    }
}
