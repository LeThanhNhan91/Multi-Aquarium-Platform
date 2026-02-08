using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Posts;
using Aquarium.Application.Wrappers;

namespace Aquarium.Application.Interfaces.Posts
{
    public interface IPostService
    {
        Task<PostResponse> CreatePostAsync(CreatePostRequest request, Guid userId);
        Task DeletePostAsync(Guid postId, Guid userId);
        Task<PostResponse> UpdatePostAsync(Guid postId, UpdatePostRequest request, Guid userId);
        Task<PagedResult<PostFeedDto>> GetNewsFeedAsync(int pageIndex, int pageSize, Guid currentUserId);
        Task<bool> ToggleLikeAsync(Guid postId, Guid userId); // True = Liked, False = Unliked
        Task<CommentDto> AddCommentAsync(Guid postId, string content, Guid userId);
        Task<PagedResult<CommentDto>> GetCommentsAsync(Guid postId, int pageIndex, int pageSize);
    }
}
