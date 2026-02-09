using System.Security.Claims;
using Aquarium.Application.DTOs.Users;
using Aquarium.Application.Interfaces.Users;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdClaim.Value);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return Ok(new ApiResponse<UserDTOs>(user));
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] GetUsersFilter filter)
        {
            var users = await _userService.GetUsersAsync(filter);
            return Ok(new ApiResponse<PagedResult<UserDTOs>>(users));
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = GetCurrentUserId();
            var user = await _userService.GetUserByIdAsync(userId);
            return Ok(new ApiResponse<UserDTOs>(user));
        }

        [HttpPut("me")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateCurrentUser([FromForm] UpdateUserRequest request)
        {
            var userId = GetCurrentUserId();
            await _userService.UpdateUserAsync(userId, request);
            return Ok(new ApiResponse<object>(null, "User information updated successfully"));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromForm] UpdateUserRequest request)
        {
            await _userService.UpdateUserAsync(id, request);
            return Ok(new ApiResponse<object>(null, "User information updated successfully"));
        }
    }
}