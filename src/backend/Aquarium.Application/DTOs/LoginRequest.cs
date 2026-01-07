using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs
{
    public record LoginRequest(string Email, string Password);
    public record AuthResponse(string Token, string FullName);
}
