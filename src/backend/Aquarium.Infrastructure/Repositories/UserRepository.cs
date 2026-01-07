using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly MultiStoreAquariumDBContext _context;
        public UserRepository(MultiStoreAquariumDBContext context) => _context = context;

        public async Task<User?> GetByEmailAsync(string email)
            => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task AddAsync(User user) => await _context.Users.AddAsync(user);

        public async Task<bool> SaveChangesAsync() => await _context.SaveChangesAsync() > 0;
    }
}
