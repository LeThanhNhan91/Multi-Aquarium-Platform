using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Chat;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Chat
{
    public interface IChatService
    {
        Task<Message> SaveMessageToStoreAsync(Guid userId, Guid storeId, string content);
        Task<Message> SaveMessageToCustomerAsync(Guid staffId, Guid conversationId, string content);
        Task<List<ConversationDto>> GetConversationsForUserAsync(Guid userId);
        Task<List<ConversationDto>> GetConversationsForStoreAsync(Guid storeId, Guid userId);
        Task<List<MessageDto>> GetMessageHistoryAsync(Guid conversationId);
        Task MarkAsReadAsync(Guid conversationId, Guid readerId);
    }
}
