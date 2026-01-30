using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Interfaces.Chat
{
    public interface IChatService
    {
        Task<Message> SaveMessageToStoreAsync(Guid userId, Guid storeId, string content);
        Task<Message> SaveMessageToCustomerAsync(Guid staffId, Guid conversationId, string content);
    }
}
