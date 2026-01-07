using Aquarium.Application.DTOs;
using Aquarium.Application.Interfaces;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtTokenGenerator tokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = tokenGenerator;
    }

    public async Task<bool> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null) return false;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        return await _userRepository.SaveChangesAsync();
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !_passwordHasher.verifyPassword(request.Password, user.PasswordHash)) return null;

        var token = _jwtTokenGenerator.GenerateToken(user);
        return new AuthResponse(token, user.FullName);
    }
}