using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Aquarium.Application.DTOs.Users;
using Aquarium.Application.Interfaces.Media;
using Aquarium.Application.Interfaces.Users;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Exceptions;
using Microsoft.AspNetCore.Http;

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

        // Helper method to split FullName into FirstName and LastName
        private (string firstName, string lastName) SplitFullName(string fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName))
            {
                return (string.Empty, string.Empty);
            }

            var words = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (words.Length == 1)
            {
                return (words[0], string.Empty);
            }
            else if (words.Length == 2)
            {
                return (words[1], words[0]);
            }
            else if (words.Length == 3)
            {
                // First word is last name, remaining is first name
                return (string.Join(" ", words.Skip(1)), words[0]);
            }
            else
            {
                // First 2 words are last name, remaining is first name
                return (string.Join(" ", words.Skip(2)), string.Join(" ", words.Take(2)));
            }
        }

        // Helper method to combine FirstName and LastName into FullName
        private string CombineFullName(string firstName, string lastName)
        {
            if (string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(lastName))
            {
                return string.Empty;
            }

            if (string.IsNullOrWhiteSpace(lastName))
            {
                return firstName.Trim();
            }

            if (string.IsNullOrWhiteSpace(firstName))
            {
                return lastName.Trim();
            }

            return $"{lastName.Trim()} {firstName.Trim()}";
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
                user.FirstName,
                user.LastName,
                user.PhoneNumber,
                user.Address,
                user.Role,
                user.Status,
                user.AvatarUrl,
                user.CoverUrl,
                user.CreatedAt
            );
        }

        public async Task<PagedResult<UserDTOs>> GetUsersAsync(GetUsersFilter filter)
        {
            var pagedData = await _userRepository.GetUsersByFilterAsync(filter);

            var userResponse = pagedData.Items.Select(user => new UserDTOs(
                user.Id,
                user.Email,
                user.FullName,
                user.FirstName,
                user.LastName,
                user.PhoneNumber,
                user.Address,
                user.Role,
                user.Status,
                user.AvatarUrl,
                user.CoverUrl,
                user.CreatedAt
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

            // Update first name and last name
            bool nameChanged = false;

            if (!string.IsNullOrEmpty(request.FirstName))
            {
                user.FirstName = request.FirstName.Trim();
                nameChanged = true;
            }

            if (!string.IsNullOrEmpty(request.LastName))
            {
                user.LastName = request.LastName.Trim();
                nameChanged = true;
            }

            // Rebuild FullName if FirstName or LastName changed
            if (nameChanged)
            {
                user.FullName = CombineFullName(user.FirstName, user.LastName);
            }

            // Update email
            if (!string.IsNullOrEmpty(request.Email))
            {
                // Check if email is already taken by another user
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null && existingUser.Id != userId)
                {
                    throw new BadRequestException("Email is already taken by another user");
                }

                user.Email = request.Email;
            }

            // Update phone number
            if (!string.IsNullOrEmpty(request.PhoneNumber))
            {
                user.PhoneNumber = request.PhoneNumber;
            }

            // Update address
            if (!string.IsNullOrEmpty(request.Address))
            {
                user.Address = request.Address;
            }

            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task UpdateAvatarAsync(Guid userId, IFormFile avatarFile)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User", userId);
            }

            // Delete old avatar if exists
            if (!string.IsNullOrEmpty(user.AvatarPublicId))
            {
                await _mediaService.DeleteMediaAsync(user.AvatarPublicId);
            }

            // Upload new avatar
            var avatarResult = await _mediaService.UploadImageAsync(avatarFile);
            user.AvatarUrl = avatarResult.Url;
            user.AvatarPublicId = avatarResult.PublicId;

            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task UpdateCoverAsync(Guid userId, IFormFile coverFile)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User", userId);
            }

            // Delete old cover if exists
            if (!string.IsNullOrEmpty(user.CoverPublicId))
            {
                await _mediaService.DeleteMediaAsync(user.CoverPublicId);
            }

            // Upload new cover
            var coverResult = await _mediaService.UploadImageAsync(coverFile);
            user.CoverUrl = coverResult.Url;
            user.CoverPublicId = coverResult.PublicId;

            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
        }
    }
}
