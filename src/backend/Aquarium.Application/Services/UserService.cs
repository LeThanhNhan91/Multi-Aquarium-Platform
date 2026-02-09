using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Aquarium.Application.DTOs.Users;
using Aquarium.Application.Interfaces.Media;
using Aquarium.Application.Interfaces.Users;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMediaService _mediaService;

        public UserService(IUserRepository userRepository, IMediaService mediaService)
        {
            _userRepository = userRepository;
            _mediaService = mediaService;
        }

        public async Task<UserDTOs> GetUserByIdAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
            {
                throw new NotFoundException("User not found", id);
            }

            return new UserDTOs(
                user.Id,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.Role,
                user.Status,
                user.AvatarUrl,
                user.CoverUrl
            );
        }

        public async Task<PagedResult<UserDTOs>> GetUsersAsync(GetUsersFilter filter)
        {
            var pagedData = await _userRepository.GetUsersByFilterAsync(filter);

            var userResponse = pagedData.Items.Select(user => new UserDTOs(
                user.Id,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.Role,
                user.Status,
                user.AvatarUrl,
                user.CoverUrl
            )).ToList();

            return new PagedResult<UserDTOs>(
                userResponse,
                pagedData.TotalCount,
                pagedData.PageIndex,
                pagedData.PageSize
            );
        }

        public async Task UpdateUserAsync(Guid userId, UpdateUserRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User", userId);
            }

            // Update basic information
            if (!string.IsNullOrEmpty(request.FullName))
            {
                user.FullName = request.FullName;
            }

            if (!string.IsNullOrEmpty(request.PhoneNumber))
            {
                user.PhoneNumber = request.PhoneNumber;
            }

            // Update avatar
            if (request.Avatar != null)
            {
                // Delete old avatar if exists
                if (!string.IsNullOrEmpty(user.AvatarPublicId))
                {
                    await _mediaService.DeleteMediaAsync(user.AvatarPublicId);
                }

                // Upload new avatar
                var avatarResult = await _mediaService.UploadImageAsync(request.Avatar);
                user.AvatarUrl = avatarResult.Url;
                user.AvatarPublicId = avatarResult.PublicId;
            }

            // Update cover image
            if (request.Cover != null)
            {
                // Delete old cover if exists
                if (!string.IsNullOrEmpty(user.CoverPublicId))
                {
                    await _mediaService.DeleteMediaAsync(user.CoverPublicId);
                }

                // Upload new cover
                var coverResult = await _mediaService.UploadImageAsync(request.Cover);
                user.CoverUrl = coverResult.Url;
                user.CoverPublicId = coverResult.PublicId;
            }

            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
        }
    }
}
