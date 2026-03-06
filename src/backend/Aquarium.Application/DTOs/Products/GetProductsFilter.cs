using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Products
{
    public class GetProductsFilter
    {
        public string? Keyword { get; set; }
        public Guid? StoreId { get; set; }
        public Guid? ExcludedStoreId { get; set; }
        public Guid? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public double? AverageRating { get; set; }
        public string? SortBy { get; set; }
        public bool IsDescending { get; set; } = false;
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
