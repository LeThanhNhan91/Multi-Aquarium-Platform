using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Orders;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Orders;
using Aquarium.Application.Wrappers;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Aquarium.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public OrderRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
        }

        public async Task<Order?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Store)
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<PagedResult<Order>> GetOrdersByFilterAsync(GetOrdersFilter filter)
        {
            var query = _context.Orders
                .Include(o => o.Store)
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                .AsNoTracking()
                .AsQueryable();

            // Filter by OrderId
            if (filter.OrderId.HasValue)
            {
                query = query.Where(o => o.Id == filter.OrderId.Value);
            }

            // Filter by StoreId
            if (filter.StoreId.HasValue)
            {
                query = query.Where(o => o.StoreId == filter.StoreId.Value);
            }

            // Search by StoreName
            if (!string.IsNullOrWhiteSpace(filter.StoreName))
            {
                query = query.Where(o => o.Store.Name.Contains(filter.StoreName));
            }

            // Filter by CustomerId
            if (filter.CustomerId.HasValue)
            {
                query = query.Where(o => o.CustomerId == filter.CustomerId.Value);
            }

            // Search by CustomerName
            if (!string.IsNullOrWhiteSpace(filter.CustomerName))
            {
                query = query.Where(o => o.Customer.FullName.Contains(filter.CustomerName));
            }

            // Search by ProductName
            if (!string.IsNullOrWhiteSpace(filter.ProductName))
            {
                query = query.Where(o => o.OrderItems.Any(oi => oi.ProductName.Contains(filter.ProductName)));
            }

            // Filter by Status
            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                query = query.Where(o => o.Status == filter.Status);
            }

            // Filter by PaymentStatus
            if (!string.IsNullOrWhiteSpace(filter.PaymentStatus))
            {
                query = query.Where(o => o.PaymentStatus == filter.PaymentStatus);
            }

            // Filter by Date Range
            if (filter.FromDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                // Include entire day
                var toDateEnd = filter.ToDate.Value.Date.AddDays(1);
                query = query.Where(o => o.CreatedAt < toDateEnd);
            }

            // Sorting
            query = filter.SortBy?.ToLower() switch
            {
                "totalamount" => filter.IsDescending
                    ? query.OrderByDescending(o => o.TotalAmount)
                    : query.OrderBy(o => o.TotalAmount),
                "status" => filter.IsDescending
                    ? query.OrderByDescending(o => o.Status)
                    : query.OrderBy(o => o.Status),
                "createdat" => filter.IsDescending
                    ? query.OrderByDescending(o => o.CreatedAt)
                    : query.OrderBy(o => o.CreatedAt),
                _ => query.OrderByDescending(o => o.CreatedAt) // Default: newest first
            };

            // Get total count
            var totalCount = await query.CountAsync();

            // Pagination
            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Order>(items, totalCount, filter.PageIndex, filter.PageSize);
        }

        public async Task<IDatabaseTransaction> BeginTransactionAsync()
        {
            var transaction = await _context.Database.BeginTransactionAsync();
            return new EfDatabaseTransaction(transaction);
        }

        public async Task<Order?> GetByIdempotencyKeyAsync(Guid idempotencyKey)
        {
            return await _context.Orders
                .FirstOrDefaultAsync(o => o.IdempotencyKey == idempotencyKey);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
