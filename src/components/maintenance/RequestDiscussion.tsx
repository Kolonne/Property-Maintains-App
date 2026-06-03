"use client";

import { FormEvent, useEffect, useState } from "react";
import type { CurrentUser } from "@/context/UserContext";

type RequestDiscussionProps = {
  requestId: string;
  currentUser: CurrentUser;
};

type MaintenanceMessage = {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: "tenant" | "landlord" | "property_manager";
  body: string;
  channel: ChatChannel;
  createdAt: string;
};

type ChatChannel = "landlord" | "tenant" | "internal";

const roleLabel: Record<MaintenanceMessage["senderRole"], string> = {
  tenant: "Tenant",
  landlord: "Landlord",
  property_manager: "Property Manager",
};

const channelOptions: Array<{
  channel: ChatChannel;
  label: string;
  helper: string;
  empty: string;
}> = [
  {
    channel: "landlord",
    label: "Landlord",
    helper: "Messages shared with the landlord for this request.",
    empty: "No landlord messages yet.",
  },
  {
    channel: "tenant",
    label: "Tenants",
    helper: "Messages shared with tenants of this unit.",
    empty: "No tenant messages yet.",
  },
  {
    channel: "internal",
    label: "Internal Notes",
    helper: "Private notes visible only to property managers.",
    empty: "No internal notes yet.",
  },
];

function formatMessageTime(value: string) {
  return new Date(value).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "?";
}

export default function RequestDiscussion({
  requestId,
  currentUser,
}: RequestDiscussionProps) {
  const [activeChannel, setActiveChannel] = useState<ChatChannel>("landlord");
  const [messages, setMessages] = useState<MaintenanceMessage[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPropertyManager = currentUser.role === "property_manager";
  const selectedChannel: ChatChannel = isPropertyManager
    ? activeChannel
    : currentUser.role === "landlord"
      ? "landlord"
      : "tenant";
  const selectedChannelOption =
    channelOptions.find((option) => option.channel === selectedChannel) ??
    channelOptions[0];
  const heading = "Request Conversation";
  const helperText = isPropertyManager
    ? selectedChannelOption.helper
    : "Messages shared with the property manager for this request.";

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      if (currentUser.id === null || currentUser.role === "null") {
        setError("You must be logged in to view messages.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          userId: String(currentUser.id),
          role: currentUser.role,
          channel: selectedChannel,
        });

        const response = await fetch(
          `/api/maintenance/requests/${requestId}/messages?${params}`
        );
        const data = (await response.json()) as {
          error?: string;
          messages?: MaintenanceMessage[];
        };

        if (!response.ok || !data.messages) {
          throw new Error(data.error ?? "Unable to load messages.");
        }

        if (isMounted) {
          setMessages(data.messages);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load messages."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [currentUser.id, currentUser.role, requestId, selectedChannel]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentUser.id === null || currentUser.role === "null") {
      setError("You must be logged in to send messages.");
      return;
    }

    const trimmedMessage = messageBody.trim();

    if (!trimmedMessage) {
      setError("Message cannot be empty.");
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      const params = new URLSearchParams({
        userId: String(currentUser.id),
        role: currentUser.role,
        channel: selectedChannel,
      });

      const response = await fetch(
        `/api/maintenance/requests/${requestId}/messages?${params}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: trimmedMessage }),
        }
      );
      const data = (await response.json()) as {
        error?: string;
        message?: MaintenanceMessage;
      };

      if (!response.ok || !data.message) {
        throw new Error(data.error ?? "Unable to send message.");
      }

      setMessages((currentMessages) => [...currentMessages, data.message!]);
      setMessageBody("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to send message."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="pm-maintenance-chat-card">
      <div className="pm-maintenance-card-heading">
        <div>
          <h2>{heading}</h2>
          <p>{helperText}</p>
        </div>
      </div>

      {isPropertyManager ? (
        <div className="pm-maintenance-chat-tabs" role="tablist">
          {channelOptions.map((option) => (
            <button
              aria-selected={activeChannel === option.channel}
              className={activeChannel === option.channel ? "is-active" : ""}
              key={option.channel}
              onClick={() => {
                setActiveChannel(option.channel);
                setMessageBody("");
              }}
              role="tab"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="pm-maintenance-chat-messages" aria-live="polite">
        {isLoading ? (
          <div className="pm-maintenance-chat-empty">Loading messages...</div>
        ) : messages.length > 0 ? (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser.id;

            return (
              <article
                className={`pm-maintenance-chat-message ${
                  isCurrentUser ? "is-current-user" : ""
                }`}
                key={message.id}
              >
                <span className="pm-maintenance-chat-avatar" aria-hidden="true">
                  {getInitials(message.senderName)}
                </span>
                <div className="pm-maintenance-chat-message-meta">
                  <div>
                    <strong>{message.senderName}</strong>
                    <span>{roleLabel[message.senderRole]}</span>
                  </div>
                  <time>{formatMessageTime(message.createdAt)}</time>
                </div>
                <p>{message.body}</p>
              </article>
            );
          })
        ) : (
          <div className="pm-maintenance-chat-empty">
            {selectedChannelOption.empty}
          </div>
        )}
      </div>

      {error ? <p className="pm-maintenance-chat-error">{error}</p> : null}

      <form className="pm-maintenance-chat-form" onSubmit={handleSubmit}>
        <label htmlFor="maintenance-chat-message">Message</label>
        <textarea
          id="maintenance-chat-message"
          value={messageBody}
          onChange={(event) => setMessageBody(event.target.value)}
          placeholder="Write a message about this request..."
          rows={3}
        />
        <button className="btn" disabled={isSending} type="submit">
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}
