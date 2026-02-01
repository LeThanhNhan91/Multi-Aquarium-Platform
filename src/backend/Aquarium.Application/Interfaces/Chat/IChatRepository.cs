using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Chat
{
    public interface IChatRepository
    {
        Task<Conversation?> GetConversationByUserAndStoreAsync(Guid userId, Guid storeId);

        Task<Conversation?> GetConversationByIdAsync(Guid conversationId);

        Task AddConversationAsync(Conversation conversation);

        Task AddMessageAsync(Message message);

        Task<List<Conversation>> GetCustomerConversationsAsync(Guid customerId);

        Task<List<Conversation>> GetStoreConversationsAsync(Guid storeId);

        Task<List<Message>> GetMessagesByConversationIdAsync(Guid conversationId);

        Task MarkMessagesAsReadAsync(Guid conversationId, Guid readerId);

        Task<bool> SaveChangesAsync();
    }
}
