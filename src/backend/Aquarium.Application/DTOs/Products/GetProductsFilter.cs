using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Products
{
    public class GetProductsFilter
    {
        public Guid? StoreId { get; set; }
        public Guid? CategoryId { get; set; }
        public string? SearchTerm { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}
