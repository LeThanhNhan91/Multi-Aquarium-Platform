using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Posts;

namespace Aquarium.Application.Interfaces.Posts
{
    public interface IPostService
    {
        Task<PostResponse> CreatePostAsync(CreatePostRequest request, Guid userId);
        Task DeletePostAsync(Guid postId, Guid userId);
        Task<PostResponse> UpdatePostAsync(Guid postId, UpdatePostRequest request, Guid userId);
    }
}
