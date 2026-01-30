namespace Aquarium.Api.Hubs
{
    public interface IChatClient
    {
        Task ReceiveMessage(string senderId, string senderName, string content, string sentAt);

        Task ReceiveNewConversation(string conversationId, string customerName, string lastMessage);

        Task ReceiveError(string message);
    }
}
