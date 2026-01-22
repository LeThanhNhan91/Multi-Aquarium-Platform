using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Media
{
    public class MediaItem
    {
        public string Url { get; set; } = string.Empty;
        public string? PublicId { get; set; }
        public bool IsPrimary { get; set; }
    }
}
