using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Media
{
    public record MediaUploadResult(
    string Url,
    string PublicId
    );
}
