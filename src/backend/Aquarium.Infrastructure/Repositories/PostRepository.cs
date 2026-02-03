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

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
