using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Store
{
    public record UpdateStoreProfileRequest(
    string Description,
    string DeliveryArea,
    string LogoUrl,       
    string CoverImageUrl,
    string VideoIntroUrl
    );
}
