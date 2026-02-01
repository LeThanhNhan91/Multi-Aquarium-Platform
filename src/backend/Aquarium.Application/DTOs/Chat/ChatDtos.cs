using System;
using System.Collections.Generic;
using System.Text;

namespace Aquarium.Application.DTOs.Chat
{
    public class ConversationDto
    {
        public Guid Id { get; set; }
        public Guid PartnerId { get; set; }
        public string PartnerName { get; set; } = string.Empty;
        public string PartnerAvatar { get; set; } = string.Empty;
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
    }

    public class MessageDto
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }
}
