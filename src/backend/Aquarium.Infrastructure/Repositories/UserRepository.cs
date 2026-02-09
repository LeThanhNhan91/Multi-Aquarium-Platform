using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Users;
using Aquarium.Application.Interfaces.Users;
using Aquarium.Application.Wrappers;
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

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await Task.CompletedTask;
        }

        public async Task<bool> SaveChangesAsync() => await _context.SaveChangesAsync() > 0;

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<PagedResult<User>> GetUsersByFilterAsync(GetUsersFilter filter)
        {
            var query = _context.Users
                .AsNoTracking()
                .AsQueryable();

            // 2. Apply Filters

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                query = query.Where(p => p.FullName.Contains(filter.Keyword) ||
                                         p.Email.Contains(filter.Keyword) ||
                                         p.PhoneNumber.Contains(filter.Keyword));
            }

            if (filter.Role.Length != 0)
            {
                query = query.Where(p => p.Role == filter.Role);
            }

            query = query.Where(p => p.Status == "Active");

            query = filter.SortBy?.ToLower() switch
            {
                "fullName" => filter.IsDescending
                    ? query.OrderByDescending(p => p.FullName)
                    : query.OrderBy(p => p.FullName),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<User>(items, totalCount, filter.PageIndex, filter.PageSize);
        }
    }
}
