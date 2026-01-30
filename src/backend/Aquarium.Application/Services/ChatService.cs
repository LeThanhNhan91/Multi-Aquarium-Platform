using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces.Chat;
using Aquarium.Domain.Entities;

namespace Aquarium.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IChatRepository _chatRepository;

        public ChatService(IChatRepository chatRepository)
        {
            _chatRepository = chatRepository;
        }

        public async Task<Message> SaveMessageToStoreAsync(Guid userId, Guid storeId, string content)
        {
            // find conversation
            var conversation = await _chatRepository.GetConversationByUserAndStoreAsync(userId, storeId);

            // Business Logic: Create new if not exists
            if (conversation == null)
            {
                conversation = new Conversation
                {
                    Id = Guid.NewGuid(),
                    StoreId = storeId,
                    CustomerId = userId,
                    LastMessageAt = DateTime.UtcNow
                };
                await _chatRepository.AddConversationAsync(conversation);
            }
            else
            {
                conversation.LastMessageAt = DateTime.UtcNow;
                // Note: Update Logic is handled by tracking, just need to SaveChanges later
            }

            // Create Message Entity
            var message = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                SenderId = userId,
                Content = content,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                Type = "Text"
            };

            await _chatRepository.AddMessageAsync(message);
            await _chatRepository.SaveChangesAsync();

            return message;
        }

        public async Task<Message> SaveMessageToCustomerAsync(Guid staffId, Guid conversationId, string content)
        {
            // get conversation
            var conversation = await _chatRepository.GetConversationByIdAsync(conversationId);

            if (conversation == null)
                throw new Exception("Conversation not found");

            var message = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                SenderId = staffId,
                Content = content,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                Type = "Text"
            };

            conversation.LastMessageAt = DateTime.UtcNow;

            await _chatRepository.AddMessageAsync(message);
            await _chatRepository.SaveChangesAsync();

            // Attach conversation back to message so the Hub can access CustomerId/StoreName
            message.Conversation = conversation;

            return message;
        }
    }
}
