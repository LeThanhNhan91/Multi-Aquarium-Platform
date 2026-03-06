using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Text;
using Aquarium.Application.DTOs.StoreMember;
using Aquarium.Application.DTOs.Stores;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Media;
using Aquarium.Application.Interfaces.Users;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class StoreService : IStoreService
    {
        private readonly IStoreRepository _storeRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMediaService _mediaService;

        public StoreService (IStoreRepository storeRepository, IUserRepository userRepository, IMediaService mediaService)
        {
            _storeRepository = storeRepository;
            _userRepository = userRepository;
            _mediaService = mediaService;
        }

        public async Task<StoreResponse> CreateStoreAsync(CreateStoreRequest request, Guid userId)
        {
            var slug = Helper.GenerateSlug(request.Name);
            if (await _storeRepository.ExistsBySlugAsync(slug))
            {
                throw new BadRequestException($"Store name '{request.Name}' is already taken (Slug conflict).");
            }

            string? logoUrl = null;
            string? logoPublicId = null;
            string? coverUrl = null;
            string? coverPublicId = null;

            if (request.Logo != null)
            {
                var logoResult = await _mediaService.UploadImageAsync(request.Logo);
                logoUrl = logoResult.Url;
                logoPublicId = logoResult.PublicId;
            }

            if (request.Cover != null)
            {
                var coverResult = await _mediaService.UploadImageAsync(request.Cover);
                coverUrl = coverResult.Url;
                coverPublicId = coverResult.PublicId;
            }

            var newStore = new Store
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Slug = slug,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                DeliveryArea = request.DeliveryArea,
                Description = request.Description ?? string.Empty,
                LogoUrl = logoUrl,
                LogoPublicId = logoPublicId,
                CoverUrl = coverUrl,
                CoverPublicId = coverPublicId,
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

            return new StoreResponse(
                newStore.Id, 
                newStore.Name, 
                newStore.Slug, 
                newStore.Status, 
                storeUser.Role, 
                0, 
                0,
                newStore.PhoneNumber,
                newStore.Address,
                newStore.DeliveryArea,
                newStore.Description,
                newStore.LogoUrl,
                newStore.CoverUrl,
                0,
                0
            );
        }

        public async Task UpdateStoreInfoAsync(Guid storeId, UpdateStoreInfoRequest request)
        {
            var store = await _storeRepository.GetByIdAsync(storeId);
            if (store == null) throw new NotFoundException("Store", storeId);

            store.Name = request.Name;
            store.PhoneNumber = request.PhoneNumber;
            store.Address = request.Address;
            store.DeliveryArea = request.DeliveryArea;
            store.Description = request.Description ?? store.Description;

            await _storeRepository.UpdateAsync(store);
            await _storeRepository.SaveChangesAsync();
        }

        public async Task UpdateStoreStatusAsync(Guid storeId, UpdateStoreStatusRequest request)
        {
            var store = await _storeRepository.GetByIdAsync(storeId);

            if (store == null)
            {
                throw new NotFoundException("Store not found!", storeId);
            }

            // Business Rule: Approval/rejection is only allowed when the store is pending.

            // Or the Admin may want to suspend an active store (to be expanded later).
            if (store.Status == request.Status)
            {
                return; // Do nothing if the state is exactly the same as before
            }

            switch (request.Status)
            {
                case "Active":
                    store.Status = "Active";
                    store.RejetionReason = null;
                    //send an email notification: "Congratulations on your shop going public!" (do later)
                    break;

                case "Rejected":
                    if (string.IsNullOrWhiteSpace(request.Reason))
                    {
                        throw new BadRequestException("Reason is required when rejecting a store.");
                    }

                    store.Status = "Rejected";
                    store.RejetionReason = request.Reason;
                    // Log the reason for rejection into the Audit Log system (do later).
                    // var reason = request.Reason; 
                    break;

                default:
                    throw new BadRequestException("Invalid status provided.");
            }

            await _storeRepository.SaveChangesAsync();
        }

        private async Task EnsureStoreOwnerAsync(Guid storeId, Guid userId)
        {
            var membership = await _storeRepository.GetStoreUserAsync(storeId, userId);

            if (membership == null || membership.Role != "Owner") throw new ForbiddenException("You are not the owner of this store!");
        }

        public async Task<PagedResult<StoreResponse>> GetStoresAsync(GetStoresFilter filter, Guid currentUserId)
        {
            var pagedData = await _storeRepository.GetStoresByFilterAsync(filter);

            var response = new List<StoreResponse>();
            var storeIds = pagedData.Items.Select(s => s.Id).ToList();

            var myRoles = await _storeRepository.GetUserRolesInStoresAsync(currentUserId, storeIds);

            var storeCounts = await _storeRepository.GetStoreCountsAsync(storeIds);

            foreach (var store in pagedData.Items)
            {
                string role = myRoles.ContainsKey(store.Id) ? myRoles[store.Id] : "Guest";

                var (productCount, orderCount) = storeCounts.GetValueOrDefault(store.Id, (0, 0));

                response.Add(new StoreResponse(
                    store.Id,
                    store.Name,
                    store.Slug,
                    store.Status,
                    role,
                    Math.Round(store.AverageRating, 1),
                    store.TotalReviews,
                    store.PhoneNumber,
                    store.Address,
                    store.DeliveryArea,
                    store.Description,
                    store.LogoUrl,
                    store.CoverUrl,
                    productCount,
                    orderCount
                ));
            }
            return new PagedResult<StoreResponse>(response, pagedData.TotalCount, pagedData.PageIndex, pagedData.PageSize);
        }

        public async Task AddMemberAsync(Guid storeId, Guid currentUserId, AddStoreMemberRequest request)
        {
            await EnsureStoreOwnerAsync(storeId, currentUserId);

            var targetUser = await _userRepository.GetByEmailAsync(request.Email);

            if (targetUser == null)
            {
                throw new NotFoundException("User with email", request.Email);
            }

            bool isAlreadyInStore = await _storeRepository.IsUserInStoreAsync(storeId, targetUser.Id);

            if (isAlreadyInStore)
            {
                throw new BadRequestException("User is already a member of this store.");
            }

            var newMember = new StoreUser
            {
                Id = Guid.NewGuid(),
                StoreId = storeId,
                UserId = targetUser.Id,
                Role = request.Role,
                CreatedAt = DateTime.UtcNow
            };

            await _storeRepository.AddStoreUserAsync(newMember);
            await _storeRepository.SaveChangesAsync();
        }


        public async Task<List<StoreMemberResponse>> GetStoreMembersAsync(Guid storeId, Guid currentUserId)
        {
            var membership = await _storeRepository.GetStoreUserAsync(storeId, currentUserId);
            if (membership == null)
            {
                throw new ForbiddenException("You are not a member of this store.");
            }

            var members = await _storeRepository.GetMembersAsync(storeId);

            // Map Entity to DTO
            return members.Select(m => new StoreMemberResponse(
                m.UserId,
                m.User.FullName,
                m.User.Email,
                m.Role,
                m.CreatedAt
            )).ToList();
        }

        public async Task RemoveMemberAsync(Guid storeId, Guid currentUserId, Guid memberIdToRemove)
        {
            await EnsureStoreOwnerAsync(storeId, currentUserId);

            var memberToRemove = await _storeRepository.GetStoreUserAsync(storeId, memberIdToRemove);

            if (memberToRemove == null) throw new NotFoundException("Member", memberIdToRemove);

            //Self-deletion is not allowed (Owner cannot kick themselves out).
            if (memberToRemove.UserId == currentUserId) throw new BadRequestException("Owner cannot remove themselves.");

            await _storeRepository.RemoveMemberAsync(memberToRemove);
            await _storeRepository.SaveChangesAsync();
        }

        public async Task<UpdateStoreMediaResponse> UpdateStoreLogoAsync(Guid storeId, Guid currentUserId, UpdateStoreLogoRequest request)
        {
            await EnsureStoreOwnerAsync(storeId, currentUserId);

            var store = await _storeRepository.GetByIdAsync(storeId);
            if (store == null) throw new NotFoundException("Store", storeId);

            // Delete old logo if exists
            if (!string.IsNullOrEmpty(store.LogoPublicId))
            {
                await _mediaService.DeleteMediaAsync(store.LogoPublicId);
            }

            // Upload new logo
            var uploadResult = await _mediaService.UploadImageAsync(request.Logo);
            store.LogoUrl = uploadResult.Url;
            store.LogoPublicId = uploadResult.PublicId;

            await _storeRepository.UpdateAsync(store);
            await _storeRepository.SaveChangesAsync();

            return new UpdateStoreMediaResponse(
                store.Id,
                store.Name,
                store.LogoUrl,
                store.CoverUrl
            );
        }

        public async Task<UpdateStoreMediaResponse> UpdateStoreCoverAsync(Guid storeId, Guid currentUserId, UpdateStoreCoverRequest request)
        {
            await EnsureStoreOwnerAsync(storeId, currentUserId);

            var store = await _storeRepository.GetByIdAsync(storeId);
            if (store == null) throw new NotFoundException("Store", storeId);

            // Delete old cover if exists
            if (!string.IsNullOrEmpty(store.CoverPublicId))
            {
                await _mediaService.DeleteMediaAsync(store.CoverPublicId);
            }

            // Upload new cover
            var uploadResult = await _mediaService.UploadImageAsync(request.Cover);
            store.CoverUrl = uploadResult.Url;
            store.CoverPublicId = uploadResult.PublicId;

            await _storeRepository.UpdateAsync(store);
            await _storeRepository.SaveChangesAsync();

            return new UpdateStoreMediaResponse(
                store.Id,
                store.Name,
                store.LogoUrl,
                store.CoverUrl
            );
        }

        public async Task<StoreApprovalResponse> ApproveStoreAsync(Guid storeId, Guid adminUserId)
        {
            var store = await _storeRepository.GetByIdAsync(storeId);
            if (store == null) throw new NotFoundException("Store", storeId);

            if (store.Status == "Active")
            {
                throw new BadRequestException("Store is already approved");
            }

            store.Status = "Active";
            store.RejetionReason = null; // Clear rejection reason if any

            await _storeRepository.UpdateAsync(store);
            await _storeRepository.SaveChangesAsync();

            return new StoreApprovalResponse(
                store.Id,
                store.Name,
                store.Status,
                store.RejetionReason,
                DateTime.UtcNow
            );
        }

        public async Task<StoreApprovalResponse> RejectStoreAsync(Guid storeId, Guid adminUserId, RejectStoreRequest request)
        {
            var store = await _storeRepository.GetByIdAsync(storeId);
            if (store == null) throw new NotFoundException("Store", storeId);

            if (store.Status == "Rejected")
            {
                throw new BadRequestException("Store is already rejected");
            }

            store.Status = "Rejected";
            store.RejetionReason = request.RejectionReason;

            await _storeRepository.UpdateAsync(store);
            await _storeRepository.SaveChangesAsync();

            return new StoreApprovalResponse(
                store.Id,
                store.Name,
                store.Status,
                store.RejetionReason,
                DateTime.UtcNow
            );
        }

        public async Task<StoreResponse> GetStoreByIdAsync(Guid storeId)
        {
            var store = await _storeRepository.GetByIdAsync(storeId);

            if (store == null)
            {
                throw new NotFoundException("Store", storeId);
            }

            var counts = await _storeRepository.GetStoreCountsAsync([storeId]);
            var (productCount, orderCount) = counts.GetValueOrDefault(storeId, (0, 0));

            return new StoreResponse(
                store.Id,
                store.Name,
                store.Slug,
                store.Status,
                "Guest",
                Math.Round(store.AverageRating, 1),
                store.TotalReviews,
                store.PhoneNumber,
                store.Address,
                store.DeliveryArea,
                store.Description,
                store.LogoUrl,
                store.CoverUrl,
                productCount,
                orderCount
            );
        }
    }
}
