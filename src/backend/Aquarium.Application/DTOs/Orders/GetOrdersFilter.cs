using System;
using System.ComponentModel.DataAnnotations;

namespace Aquarium.Application.DTOs.Orders
{
    public class GetOrdersFilter
    {
        public Guid? OrderId { get; set; }

        public Guid? StoreId { get; set; }

        public string? StoreName { get; set; }

        public Guid? CustomerId { get; set; }

        public string? CustomerName { get; set; }

        public string? ProductName { get; set; }

        public string? Status { get; set; }

        public string? PaymentStatus { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public string? SortBy { get; set; }

        public bool IsDescending { get; set; } = true;

        [Range(1, int.MaxValue)]
        public int PageIndex { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 20;
    }
}
