using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Posts
{
    public interface IPostRepository
    {
        Task AddAsync(StorePost post);
        Task<StorePost?> GetByIdWithMediaAsync(Guid id);
        Task DeleteAsync(StorePost post);
        Task<(List<StorePost> posts, int totalCount)> GetNewsFeedAsync(int pageIndex, int pageSize);
        Task<PostLike?> GetLikeAsync(Guid postId, Guid userId);
        Task AddLikeAsync(PostLike like);
        Task RemoveLikeAsync(PostLike like);
        Task AddCommentAsync(PostComment comment);
        Task<(List<PostComment> comments, int totalCount)> GetCommentsAsync(Guid postId, int pageIndex, int pageSize);
        Task<bool> SaveChangesAsync();
    }
}
