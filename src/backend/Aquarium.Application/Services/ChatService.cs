using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.DTOs.Chat;
using Aquarium.Application.Interfaces;
using Aquarium.Application.Interfaces.Chat;
using Aquarium.Domain.Constants;
using Aquarium.Domain.Entities;
using Aquarium.Domain.Exceptions;

namespace Aquarium.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IChatRepository _chatRepository;
        private readonly IStoreRepository _storeRepository;

        public ChatService(IChatRepository chatRepository, IStoreRepository storeRepository)
        {
            _chatRepository = chatRepository;
            _storeRepository = storeRepository;
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

        public async Task<List<ConversationDto>> GetConversationsForUserAsync(Guid userId)
        {
            var conversations = await _chatRepository.GetCustomerConversationsAsync(userId);

            return conversations.Select(c => new ConversationDto
            {
                Id = c.Id,
                PartnerId = c.StoreId,
                PartnerName = c.Store?.Name ?? "Unknown Store",
                // Get the last message to display the preview
                LastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault()?.Content ?? "",
                LastMessageAt = c.LastMessageAt ?? DateTime.MinValue,
                // Count the number of unread messages sent from the Store (SenderId != UserId)
                UnreadCount = c.Messages.Count(m => m.IsRead == false && m.SenderId != userId)
            }).ToList();
        }

        public async Task<List<ConversationDto>> GetConversationsForStoreAsync(Guid storeId, Guid userId)
        {
            var member = await _storeRepository.GetStoreUserAsync(storeId, userId);
            if (member == null || !StoreRoles.AllRoles.Contains(member.Role))
            {
                throw new ForbiddenException("You are not an store member of this store!");
            }

            var conversations = await _chatRepository.GetStoreConversationsAsync(storeId);

            var storeStaffIds = await _storeRepository.GetStoreStaffIdsAsync(storeId);

            return conversations.Select(c => new ConversationDto
            {
                Id = c.Id,
                PartnerId = c.CustomerId,
                PartnerName = c.Customer?.FullName ?? "Unknown Customer",
                LastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault()?.Content ?? "",
                LastMessageAt = c.LastMessageAt ?? DateTime.MinValue,
                // Count the number of unread messages sent from the Customer (SenderId != Store/Staff)

                // Note: This logic assumes the logged-in Staff has a different ID than the Customer.

                // For absolute accuracy, check that the SenderId is not in the Store Staff list.

                // But at the MVP level, we check SenderId == CustomerId
                UnreadCount = c.Messages.Count(m =>
                    m.IsRead == false &&
                    !storeStaffIds.Contains(m.SenderId))

            }).ToList();
        }

        public async Task<List<MessageDto>> GetMessageHistoryAsync(Guid conversationId)
        {
            var messages = await _chatRepository.GetMessagesByConversationIdAsync(conversationId);

            return messages.Select(m => new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                Content = m.Content,
                CreatedAt = m.CreatedAt ?? DateTime.MinValue,
                IsRead = m.IsRead ?? false
            }).ToList();
        }

        public async Task MarkAsReadAsync(Guid conversationId, Guid readerId)
        {
            await _chatRepository.MarkMessagesAsReadAsync(conversationId, readerId);
            await _chatRepository.SaveChangesAsync();
        }
    }
}
