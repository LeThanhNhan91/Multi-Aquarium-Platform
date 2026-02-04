using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Posts
{
    public class PostFeedDto
    {
        public Guid Id { get; set; }
        public Guid StoreId { get; set; }
        public string StoreName { get; set; }
        public string LogoUrl { get; set; }

        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }

        // Media
        public List<PostMediaDto> Media { get; set; } = new List<PostMediaDto>();

        // Social Stats
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
    }

    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string UserAvatar { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCommentRequest
    {
        public string Content { get; set; }
    }
}
