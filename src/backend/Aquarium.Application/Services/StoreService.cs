using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Text;
using Aquarium.Application.DTOs.Store;
using Aquarium.Application.Interfaces;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class StoreService : IStoreService
    {
        private readonly IStoreRepository _storeRepository;
        private readonly IUserRepository _userRepository;

        public StoreService (IStoreRepository storeRepository, IUserRepository userRepository)
        {
            _storeRepository = storeRepository;
            _userRepository = userRepository;
        }

        public async Task<StoreResponse> CreateStoreAsync(CreateStoreRequest request, Guid userId)
        {
            var slug = Helper.GenerateSlug(request.Name);
            if (await _storeRepository.ExistsBySlugAsync(slug))
            {
                throw new BadRequestException($"Store name '{request.Name}' is already taken (Slug conflict).");
            }

            var newStore = new Store
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Slug = slug,
                Address = request.Address,
                DeliveryArea = request.DeliveryArea,
                Description = request.Description ?? string.Empty,
                LogoUrl = null,
                CoverImageUrl = null,
                VideoIntroUrl = null,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            var storeUser = new StoreUser
            {
                Id = Guid.NewGuid(),
                StoreId = newStore.Id,
                UserId = userId,
                Role = "Owner",
                CreatedAt = DateTime.UtcNow
            };

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new NotFoundException("User not found: ", userId);

            if (user.Role == "Customer") user.Role = "StoreOwner";

            //Save Transaction
            await _storeRepository.AddAsync(newStore);
            await _storeRepository.AddStoreUserAsync(storeUser);

            await _storeRepository.SaveChangesAsync();

            return new StoreResponse(newStore.Id, newStore.Name, newStore.Slug, newStore.Status, storeUser.Role);
        }
    }
}
