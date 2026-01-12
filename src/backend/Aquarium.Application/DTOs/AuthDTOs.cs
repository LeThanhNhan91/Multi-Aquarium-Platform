using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs
{
    public record AuthResponse(string AccessToken, string RefreshToken, string FullName);
    public record RefreshTokenRequest(string AccessToken, string RefreshToken);
}
