using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class StoreRepository : IStoreRepository
    {
        private readonly MultiStoreAquariumDBContext _context;
        public StoreRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Store store)
        {
            await _context.Stores.AddAsync(store);
        }

        public async Task AddStoreUserAsync(StoreUser storeUser)
        {
            await _context.StoreUsers.AddAsync(storeUser);
        }

        public async Task<bool> ExistsBySlugAsync(string slug)
        {
            return await _context.Stores.AnyAsync(s => s.Slug == slug);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
