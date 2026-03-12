using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aquarium.Application.DTOs.Doa;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Doa;
using Aquarium.Application.Interfaces.Orders;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Constants;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class DoaService : IDoaService
    {
        private readonly IDoaRepository _doaRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IStoreRepository _storeRepository;

        public DoaService(
            IDoaRepository doaRepository,
            IOrderRepository orderRepository,
            IStoreRepository storeRepository)
        {
            _doaRepository = doaRepository;
            _orderRepository = orderRepository;
            _storeRepository = storeRepository;
        }

        public async Task<DoaRequestResponse> CreateDoaRequestAsync(CreateDoaRequest request, Guid customerId)
        {
            var order = await _orderRepository.GetByIdWithDetailsAsync(request.OrderId);
            if (order == null)
                throw new NotFoundException("Order", request.OrderId);

            if (order.CustomerId != customerId)
                throw new ForbiddenException("You can only submit DOA requests for your own orders.");

            if (order.Status != OrderStatus.Completed)
                throw new BadRequestException("DOA requests can only be submitted for completed (delivered) orders.");

            if (order.CompletedAt == null || DateTime.UtcNow - order.CompletedAt.Value > TimeSpan.FromHours(24))
                throw new BadRequestException("The DOA window has expired. Requests must be submitted within 24 hours of delivery.");

            var existing = await _doaRepository.GetByOrderIdAsync(request.OrderId);
            if (existing != null)
                throw new BadRequestException("A DOA request has already been submitted for this order.");

            var doa = new DoaRequest
            {
                Id = Guid.NewGuid(),
                OrderId = request.OrderId,
                CustomerId = customerId,
                Reason = request.Reason,
                Status = DoaStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _doaRepository.AddAsync(doa);
            await _doaRepository.SaveChangesAsync();

            // Attach evidence media
            if (request.Media?.Count > 0)
            {
                foreach (var (item, i) in request.Media.Select((m, i) => (m, i)))
                {
                    doa.Media.Add(new DoaRequestMedia
                    {
                        Id = Guid.NewGuid(),
                        DoaRequestId = doa.Id,
                        MediaUrl = item.Url,
                        PublicId = item.PublicId,
                        MediaType = item.MediaType,
                        DisplayOrder = i,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                await _doaRepository.SaveChangesAsync();
            }

            // Move order to DoaRequested status
            order.Status = OrderStatus.DoaRequested;
            await _orderRepository.SaveChangesAsync();

            var created = await _doaRepository.GetByIdWithDetailsAsync(doa.Id);
            return MapToResponse(created!);
        }

        public async Task<DoaRequestResponse> GetDoaRequestByIdAsync(Guid doaRequestId, Guid userId)
        {
            var doa = await _doaRepository.GetByIdWithDetailsAsync(doaRequestId);
            if (doa == null)
                throw new NotFoundException("DOA request", doaRequestId);

            await AssertUserCanAccessAsync(doa, userId);
            return MapToResponse(doa);
        }

        public async Task<DoaRequestResponse?> GetDoaRequestByOrderAsync(Guid orderId, Guid userId)
        {
            var doa = await _doaRepository.GetByOrderIdAsync(orderId);
            if (doa == null) return null;

            doa = await _doaRepository.GetByIdWithDetailsAsync(doa.Id);
            if (doa == null) return null;

            await AssertUserCanAccessAsync(doa, userId);
            return MapToResponse(doa);
        }

        public async Task<DoaRequestResponse> ReviewDoaRequestAsync(
            Guid doaRequestId,
            ReviewDoaRequestRequest request,
            Guid reviewerId,
            Guid storeId)
        {
            var doa = await _doaRepository.GetByIdWithDetailsAsync(doaRequestId);
            if (doa == null)
                throw new NotFoundException("DOA request", doaRequestId);

            if (doa.Order.StoreId != storeId)
                throw new ForbiddenException("This DOA request does not belong to your store.");

            var storeUser = await _storeRepository.GetStoreUserAsync(storeId, reviewerId);
            if (storeUser == null || (storeUser.Role != StoreRoles.Owner && storeUser.Role != StoreRoles.Manager))
                throw new ForbiddenException("Only store owners or managers can review DOA requests.");

            if (doa.Status != DoaStatus.Pending)
                throw new BadRequestException($"This DOA request has already been {doa.Status.ToLower()}.");

            var decision = request.Decision;
            if (decision != DoaStatus.Approved && decision != DoaStatus.Rejected)
                throw new BadRequestException("Decision must be 'Approved' or 'Rejected'.");

            doa.Status = decision;
            doa.ReviewNote = request.ReviewNote;
            doa.ReviewedBy = reviewerId;
            doa.ReviewedAt = DateTime.UtcNow;

            // Reflect decision on the linked order
            var order = doa.Order;
            if (decision == DoaStatus.Approved)
            {
                order.Status = OrderStatus.DoaApproved;
                order.PaymentStatus = PaymentsStatus.Refunded;
            }
            else
            {
                // Rejected → revert order back to Completed
                order.Status = OrderStatus.Completed;
            }

            // Single SaveChanges persists both DoaRequest and Order (same DbContext)
            await _doaRepository.SaveChangesAsync();

            var updated = await _doaRepository.GetByIdWithDetailsAsync(doa.Id);
            return MapToResponse(updated!);
        }

        public async Task<PagedResult<DoaRequestResponse>> GetDoaRequestsByStoreAsync(
            Guid storeId,
            GetDoaRequestsFilter filter,
            Guid userId)
        {
            var storeUser = await _storeRepository.GetStoreUserAsync(storeId, userId);
            if (storeUser == null || (storeUser.Role != StoreRoles.Owner && storeUser.Role != StoreRoles.Manager))
                throw new ForbiddenException("Only store owners or managers can view DOA requests.");

            var paged = await _doaRepository.GetByStoreAsync(storeId, filter);
            var responses = paged.Items.Select(d => MapToResponse(d)).ToList();
            return new PagedResult<DoaRequestResponse>(responses, paged.TotalCount, paged.PageIndex, paged.PageSize);
        }

        // ------------------------------------------------------------------ helpers

        private async Task AssertUserCanAccessAsync(DoaRequest doa, Guid userId)
        {
            if (doa.CustomerId == userId) return;

            var storeUser = await _storeRepository.GetStoreUserAsync(doa.Order.StoreId, userId);
            bool isStoreManager = storeUser != null &&
                (storeUser.Role == StoreRoles.Owner || storeUser.Role == StoreRoles.Manager);

            if (!isStoreManager)
                throw new ForbiddenException("You are not allowed to view this DOA request.");
        }

        private static DoaRequestResponse MapToResponse(DoaRequest doa) => new DoaRequestResponse
        {
            Id = doa.Id,
            OrderId = doa.OrderId,
            CustomerId = doa.CustomerId,
            CustomerName = doa.Customer?.FullName ?? "Unknown",
            CustomerAvatarUrl = doa.Customer?.AvatarUrl,
            Reason = doa.Reason,
            Status = doa.Status,
            ReviewNote = doa.ReviewNote,
            ReviewedByName = doa.ReviewedByUser?.FullName,
            CreatedAt = doa.CreatedAt,
            ReviewedAt = doa.ReviewedAt,
            Media = doa.Media?
                .OrderBy(m => m.DisplayOrder)
                .Select(m => new DoaMediaResponse
                {
                    Id = m.Id,
                    MediaUrl = m.MediaUrl,
                    MediaType = m.MediaType,
                    DisplayOrder = m.DisplayOrder
                }).ToList() ?? new List<DoaMediaResponse>()
        };
    }
}
