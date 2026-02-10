using System.Security.Claims;
using Aquarium.Application.DTOs;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Users;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IStoreRepository _storeRepository;

    public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtTokenGenerator tokenGenerator, IStoreRepository storeRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = tokenGenerator;
        _storeRepository = storeRepository;
    }

    public async Task<bool> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null) return false;

        // Split FullName into FirstName and LastName
        var (firstName, lastName) = SplitFullName(request.FullName);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FullName = request.FullName,
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = request.PhoneNumber,
            Role = "Customer",
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        return await _userRepository.SaveChangesAsync();
    }

    // Helper method to split FullName into FirstName and LastName
    private (string firstName, string lastName) SplitFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
        {
            return (string.Empty, string.Empty);
        }

        var words = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (words.Length == 1)
        {
            return (words[0], string.Empty);
        }
        else if (words.Length == 2)
        {
            return (words[1], words[0]);
        }
        else if (words.Length == 3)
        {
            // First word is last name, remaining is first name
            return (string.Join(" ", words.Skip(1)), words[0]);
        }
        else
        {
            // First 2 words are last name, remaining is first name
            return (string.Join(" ", words.Skip(2)), string.Join(" ", words.Take(2)));
        }
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !_passwordHasher.verifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        Guid? storeId = null;
        storeId = await _storeRepository.GetStoreIdByUserIdAsync(user.Id);

        var accessToken = _jwtTokenGenerator.GenerateToken(user, storeId);

        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userRepository.SaveChangesAsync();

        return new AuthResponse(accessToken, refreshToken ,user.FullName);
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        // Decode old access token to get Principal
        var principal = _jwtTokenGenerator.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null) throw new UnauthorizedException("Invalid access token format.");

        // Get userId from claims
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier) ?? principal.FindFirst("sub");
        if (userIdClaim == null) throw new UnauthorizedException("Access token does not contain User Id.");

        var userId = Guid.Parse(userIdClaim.Value);

        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null || user.RefreshToken != request.RefreshToken)
        {
            throw new UnauthorizedException("Invalid Refresh Token.");
        }

        if (user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new UnauthorizedException("Refresh Token has expired. Please login again.");
        }

        var newAccessToken = _jwtTokenGenerator.GenerateToken(user);
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userRepository.SaveChangesAsync();

        return new AuthResponse(newAccessToken, newRefreshToken, user.FullName);
    }
}