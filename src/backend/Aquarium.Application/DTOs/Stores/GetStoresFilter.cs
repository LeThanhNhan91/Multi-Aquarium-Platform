using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Stores
{
    public class GetStoresFilter
    {
        public Guid? StoreId { get; set; }
        public Guid? UserId { get; set; }
        public string? Slug { get; set; }
        public string? SearchTerm { get; set; } 
        public string? Status { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
