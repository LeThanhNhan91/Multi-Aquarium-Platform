using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces.Posts;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class PostRepository : IPostRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public PostRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task AddAsync(StorePost post)
        {
            await _context.StorePosts.AddAsync(post);
        }

        public async Task<StorePost?> GetByIdWithMediaAsync(Guid id)
        {
            return await _context.StorePosts
                .Include(p => p.PostMedia)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task DeleteAsync(StorePost post)
        {
            _context.StorePosts.Remove(post);
        }

        public async Task<(List<StorePost> posts, int totalCount)> GetNewsFeedAsync(int pageIndex, int pageSize)
        {
            var query = _context.StorePosts
                .Include(p => p.Store)
                .Include(p => p.PostMedia)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .OrderByDescending(p => p.CreatedAt);

            var totalCount = await query.CountAsync();

            var posts = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (posts, totalCount);
        }

        public async Task<PostLike?> GetLikeAsync(Guid postId, Guid userId)
        {
            return await _context.PostLikes.FindAsync(postId, userId);
        }

        public async Task AddLikeAsync(PostLike like)
        {
            await _context.PostLikes.AddAsync(like);
        }

        public async Task RemoveLikeAsync(PostLike like)
        {
            _context.PostLikes.Remove(like);
        }

        public async Task AddCommentAsync(PostComment comment)
        {
            await _context.PostComments.AddAsync(comment);
        }

        public async Task<(List<PostComment> comments, int totalCount)> GetCommentsAsync(Guid postId, int pageIndex, int pageSize)
        {
            var query = _context.PostComments
                .Include(c => c.User) 
                .Where(c => c.PostId == postId)
                .OrderByDescending(c => c.CreatedAt);

            var totalCount = await query.CountAsync();

            var comments = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (comments, totalCount);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
