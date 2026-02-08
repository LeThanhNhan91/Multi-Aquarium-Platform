using System.Security.Claims;
using Aquarium.Application.Interfaces.Chat;
using Aquarium.Application.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aquarium.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpGet("my-conversations")]
        public async Task<IActionResult> GetMyConversations()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _chatService.GetConversationsForUserAsync(userId);
            return Ok(new ApiResponse<object>(result));
        }

        [HttpGet("store/{storeId}/conversations")]
        public async Task<IActionResult> GetStoreConversations(Guid storeId)
        {
            // TODO: Validate User is Owner of this Store (Add logic check here)
            var userId = GetCurrentUserId();
            var result = await _chatService.GetConversationsForStoreAsync(storeId, userId);
            return Ok(new ApiResponse<object>(result));
        }

        [HttpGet("conversations/{id}/messages")]
        public async Task<IActionResult> GetMessages(Guid id)
        {
            var result = await _chatService.GetMessageHistoryAsync(id);
            return Ok(new ApiResponse<object>(result));
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdClaim.Value);
        }
    }
}
