import { MedusaService } from "@medusajs/framework/utils";
import Conversation from "./models/conversation";
import Message from "./models/message";

/**
 * Messaging Service
 * Handles buyer-vendor communication
 */
class MessagingService extends MedusaService({ Conversation, Message }) {
  /**
   * Send a message in a conversation
   */
  async sendMessage(data: {
    conversation_id: string;
    sender_id: string;
    sender_type: "buyer" | "vendor";
    recipient_id: string;
    recipient_type: "buyer" | "vendor";
    subject?: string;
    body: string;
    attachments?: string[];
    product_reference?: string;
  }) {
    const message = await this.createMessages({
      ...data,
      attachments: data.attachments as any, // JSON type
    });

    // Update conversation last_message_at
    await this.updateConversations({
      id: data.conversation_id,
      last_message_at: new Date(),
    });

    return message;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string) {
    return await this.updateMessages({
      id: messageId,
      is_read: true,
    });
  }

  /**
   * Get conversation with messages
   */
  async getConversation(
    conversationId: string,
    options?: { limit?: number; offset?: number }
  ) {
    const conversation = await this.retrieveConversation(conversationId);

    const messages = await this.listMessages(
      { conversation_id: conversationId },
      {
        order: { created_at: "DESC" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }
    );

    return { conversation, messages };
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(
    userId: string,
    userType: "buyer" | "vendor",
    options?: { limit?: number; offset?: number }
  ) {
    // Find conversations where user is participant_one or participant_two
    const conversations = await this.listConversations(
      {
        $or: [
          { participant_one_id: userId, participant_one_type: userType },
          { participant_two_id: userId, participant_two_type: userType },
        ],
      } as any,
      {
        order: { last_message_at: "DESC" },
        take: options?.limit || 20,
        skip: options?.offset || 0,
      }
    );

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.listMessages(
          {
            conversation_id: conv.id,
            recipient_id: userId,
            is_read: false,
          },
          { select: ["id"] }
        );

        return {
          ...conv,
          unread_count: unreadCount.length,
        };
      })
    );

    return conversationsWithUnread;
  }

  /**
   * Create or retrieve conversation between two participants
   */
  async createConversation(data: {
    participant_one_id: string;
    participant_one_type: "buyer" | "vendor";
    participant_two_id: string;
    participant_two_type: "buyer" | "vendor";
    product_reference?: string;
  }) {
    // Check if conversation already exists (bidirectional check)
    const existing = await this.listConversations({
      $or: [
        {
          participant_one_id: data.participant_one_id,
          participant_two_id: data.participant_two_id,
        },
        {
          participant_one_id: data.participant_two_id,
          participant_two_id: data.participant_one_id,
        },
      ],
    } as any);

    if (existing && existing.length > 0) {
      return existing[0];
    }

    // Create new conversation
    return await this.createConversations(data);
  }
}

export default MessagingService;
