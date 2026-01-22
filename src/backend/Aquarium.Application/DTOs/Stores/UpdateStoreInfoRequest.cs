using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Media;

namespace Aquarium.Application.DTOs.Stores
{
    public class UpdateStoreInfoRequest
    {
        public string? Description { get; set; }
        public MediaItem? Logo { get; set; }
        public MediaItem? Cover { get; set; }
    }
}
