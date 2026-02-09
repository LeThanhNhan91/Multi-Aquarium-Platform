using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Users;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Users
{
    public interface IUserRepository
    {
        Task<PagedResult<User>> GetUsersByFilterAsync(GetUsersFilter filter);
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task<bool> SaveChangesAsync();
        Task<User?> GetByIdAsync(Guid id);
    }
}
