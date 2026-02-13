using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Categories
{
    public class GetCategoryFilter
    {
        public string ? Keyword { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
