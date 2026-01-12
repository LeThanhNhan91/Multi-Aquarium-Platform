using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs;

namespace Aquarium.Application.Interfaces
{
    public interface IAuthService
    {
        Task<bool> RegisterAsync(RegisterRequest request);
        Task<AuthResponse?> LoginAsync(LoginRequest request);
        Task<AuthResponse?> RefreshTokenAsync(RefreshTokenRequest request);
    }
}
