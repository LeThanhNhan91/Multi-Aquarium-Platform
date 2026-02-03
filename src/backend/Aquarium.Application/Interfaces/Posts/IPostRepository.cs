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
        Task<bool> SaveChangesAsync();
    }
}
