using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace Aquarium.Application.DTOs.Stores
{
    public class UpdateStoreInfoRequest
    {
        public string? Description { get; set; }
        public IFormFile? Logo { get; set; }
        public IFormFile? Cover { get; set; }
    }
}
