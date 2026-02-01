using System;
using System.Collections.Generic;
using System.Text;
using Aquarium.Application.Interfaces.Chat;
using Aquarium.Domain.Entities;
using Aquarium.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aquarium.Infrastructure.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly MultiStoreAquariumDBContext _context;

        public ChatRepository(MultiStoreAquariumDBContext context)
        {
            _context = context;
        }

        public async Task<Conversation?> GetConversationByUserAndStoreAsync(Guid userId, Guid storeId)
        {
            return await _context.Conversations
                .Include(c => c.Customer)
                .Include(c => c.Store)
                .FirstOrDefaultAsync(c => c.StoreId == storeId && c.CustomerId == userId);
        }

        public async Task<Conversation?> GetConversationByIdAsync(Guid conversationId)
        {
            return await _context.Conversations
                .Include(c => c.Store)
                .Include(c => c.Customer)
                .FirstOrDefaultAsync(c => c.Id == conversationId);
        }

        public async Task AddConversationAsync(Conversation conversation)
        {
            await _context.Conversations.AddAsync(conversation);
        }

        public async Task AddMessageAsync(Message message)
        {
            await _context.Messages.AddAsync(message);
        }

        public async Task<List<Conversation>> GetCustomerConversationsAsync(Guid customerId)
        {
            return await _context.Conversations
                .Include(c => c.Store)
                .Include(c => c.Messages) // Load messages to calculate unread count
                .Where(c => c.CustomerId == customerId)
                .OrderByDescending(c => c.LastMessageAt)
                .ToListAsync();
        }

        public async Task<List<Conversation>> GetStoreConversationsAsync(Guid storeId)
        {
            return await _context.Conversations
                .Include(c => c.Customer)
                .Include(c => c.Messages)
                .Where(c => c.StoreId == storeId)
                .OrderByDescending(c => c.LastMessageAt)
                .ToListAsync();
        }

        public async Task<List<Message>> GetMessagesByConversationIdAsync(Guid conversationId)
        {
            return await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.CreatedAt) // Order oldest -> newest
                .ToListAsync();
        }

        public async Task MarkMessagesAsReadAsync(Guid conversationId, Guid readerId)
        {
            // Find all messages in this conversation
            // BUT: Not read (IsRead = false) AND Sender is NOT the reader (SenderId != readerId)
            var unreadMessages = await _context.Messages
                .Where(m => m.ConversationId == conversationId
                            && m.IsRead == false
                            && m.SenderId != readerId)
                .ToListAsync();

            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                }
            }
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
