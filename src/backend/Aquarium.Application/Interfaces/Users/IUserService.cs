using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Users;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.Interfaces.Users
{
    public interface IUserService
    {
        Task<UserDTOs> GetUserByIdAsync(Guid id);
        Task<PagedResult<UserDTOs>> GetUsersAsync(GetUsersFilter filter);
        Task UpdateUserAsync(Guid userId, UpdateUserRequest request);
        Task UpdateAvatarAsync(Guid userId, IFormFile avatarFile);
        Task UpdateCoverAsync(Guid userId, IFormFile coverFile);
    }
}
