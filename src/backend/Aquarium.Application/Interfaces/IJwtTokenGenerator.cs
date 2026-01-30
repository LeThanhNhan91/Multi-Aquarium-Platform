using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user, Guid? storeId = null);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
