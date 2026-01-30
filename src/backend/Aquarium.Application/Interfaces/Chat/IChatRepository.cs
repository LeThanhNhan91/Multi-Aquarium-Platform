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

        Task<bool> SaveChangesAsync();
    }
}
