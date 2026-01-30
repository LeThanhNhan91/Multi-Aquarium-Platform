using Aquarium.Application.Interfaces.Chat;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub<IChatClient>
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");

            var storeIdClaim = Context.User?.FindFirst("StoreId")?.Value;
            if (!string.IsNullOrEmpty(storeIdClaim))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Store_{storeIdClaim}");
            }

            await base.OnConnectedAsync();
        }

        public async Task SendMessageToStore(Guid storeId, string content)
        {
            try
            {
                var userId = Guid.Parse(Context.UserIdentifier);
                var senderName = Context.User?.Identity?.Name ?? "Customer";

                var message = await _chatService.SaveMessageToStoreAsync(userId, storeId, content);

                // Broadcast
                string sentAt = message.CreatedAt?.ToString("o") ?? "";

                await Clients.Group($"Store_{storeId}")
                    .ReceiveMessage(userId.ToString(), senderName, content, sentAt);

                await Clients.Group($"Store_{storeId}")
                    .ReceiveNewConversation(message.ConversationId.ToString(), senderName, content);
            }
            catch (Exception ex)
            {
                await Clients.Caller.ReceiveError(ex.Message);
            }
        }

        public async Task SendMessageToCustomer(Guid conversationId, string content)
        {
            try
            {
                var staffId = Guid.Parse(Context.UserIdentifier);

                var message = await _chatService.SaveMessageToCustomerAsync(staffId, conversationId, content);

                // Gather information for broadcasting.
                // Since ChatService returned the message along with the Conversation (included in the Repo), we can access the CustomerId.
                if (message.Conversation == null)
                {
                    // Fallback
                    return;
                }

                var customerId = message.Conversation.CustomerId;
                var storeName = message.Conversation.Store?.Name ?? "Store Support";
                string sentAt = message.CreatedAt?.ToString("o") ?? "";

                // Send messages to the correct Customer Group.
                await Clients.Group($"User_{customerId}")
                    .ReceiveMessage(staffId.ToString(), storeName, content, sentAt);
            }
            catch (Exception ex)
            {
                await Clients.Caller.ReceiveError(ex.Message);
            }
        }
    }
}
