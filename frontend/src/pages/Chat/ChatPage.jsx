import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

// Fake chat data — one conversation per consumer
const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    consumerName: "Green Market Store",
    lastMessageAt: "2025-11-10 12:30",
    unreadCount: 1,
    messages: [
      {
        id: 1,
        from: "CONSUMER",
        text: "Hello, can we change delivery time for today's order?",
        time: "12:25",
      },
      {
        id: 2,
        from: "SUPPLIER",
        text: "Hi! Yes, what time is convenient for you?",
        time: "12:28",
      },
      {
        id: 3,
        from: "CONSUMER",
        text: "After 17:00 would be perfect.",
        time: "12:30",
      },
    ],
  },
  {
    id: 2,
    consumerName: "Almaty Supermarket",
    lastMessageAt: "2025-11-09 09:10",
    unreadCount: 0,
    messages: [
      {
        id: 1,
        from: "SUPPLIER",
        text: "Your order #0102 is ready for pickup.",
        time: "08:45",
      },
      {
        id: 2,
        from: "CONSUMER",
        text: "Great, thanks. We'll come at 11:00.",
        time: "09:10",
      },
    ],
  },
  {
    id: 3,
    consumerName: "Small Cafe Astana",
    lastMessageAt: "2025-11-02 18:05",
    unreadCount: 0,
    messages: [
      {
        id: 1,
        from: "CONSUMER",
        text: "We received milk close to expiration date.",
        time: "17:40",
      },
      {
        id: 2,
        from: "SUPPLIER",
        text: "Sorry for that, we will check and replace.",
        time: "17:50",
      },
      {
        id: 3,
        from: "CONSUMER",
        text: "Thank you.",
        time: "18:05",
      },
    ],
  },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState(INITIAL_CONVERSATIONS[0]?.id);
  const [draft, setDraft] = useState("");

  const isOwner = user.role === "OWNER";
  const isManager = user.role === "MANAGER";
  const canChat = isOwner || isManager; // we don't allow SALES on web

  const selectedConversation =
    conversations.find((c) => c.id === selectedId) || null;

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    // mark unread as 0
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSend = (e) => {
    e?.preventDefault?.();
    if (!canChat) return;
    if (!selectedConversation || !draft.trim()) return;

    const newText = draft.trim();
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5); // "HH:MM"

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              lastMessageAt: `2025-11-10 ${timeStr}`,
              messages: [
                ...c.messages,
                {
                  id: Date.now(),
                  from: "SUPPLIER",
                  text: newText,
                  time: timeStr,
                },
              ],
            }
          : c
      )
    );

    setDraft("");
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem-2.5rem)] gap-4">
      {/* Left: conversation list */}
      <div className="w-full md:w-72 bg-white border rounded-lg shadow-sm flex flex-col">
        <div className="p-3 border-b">
          <h1 className="text-sm font-semibold">Chats</h1>
          <p className="text-[11px] text-slate-500">
            Conversations with linked consumers.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-3 text-sm text-slate-500">
              No conversations yet.
            </div>
          ) : (
            <ul>
              {conversations.map((c) => (
                <li
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`px-3 py-2 border-b cursor-pointer hover:bg-slate-50 ${
                    c.id === selectedId ? "bg-slate-100" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <div className="text-sm font-medium truncate">
                      {c.consumerName}
                    </div>
                    <div className="text-[11px] text-slate-400 whitespace-nowrap">
                      {c.lastMessageAt.split(" ")[1]}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <div className="text-[11px] text-slate-500 truncate">
                      {c.messages[c.messages.length - 1]?.text}
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-[10px]">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right: chat view */}
      <div className="flex-1 bg-white border rounded-lg shadow-sm flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            Select a conversation on the left.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">
                  {selectedConversation.consumerName}
                </div>
                <div className="text-[11px] text-slate-500">
                  Linked consumer • chat is stored only in frontend now
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                You are chatting as <strong>{user.role}</strong>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-50">
              {selectedConversation.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.from === "SUPPLIER" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      m.from === "SUPPLIER"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div
                      className={`mt-1 text-[10px] ${
                        m.from === "SUPPLIER"
                          ? "text-blue-100 text-right"
                          : "text-slate-400 text-right"
                      }`}
                    >
                      {m.time} •{" "}
                      {m.from === "SUPPLIER" ? "You" : "Consumer"}
                    </div>
                  </div>
                </div>
              ))}

              {selectedConversation.messages.length === 0 && (
                <div className="text-sm text-slate-500 text-center mt-8">
                  No messages yet. Start the conversation below.
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="border-t px-3 py-2 flex items-center gap-2 bg-white"
            >
              {!canChat && (
                <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  Chat is available only for Owners and Managers on web.
                </div>
              )}
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  canChat
                    ? "Type a message..."
                    : "You don't have permission to send messages."
                }
                disabled={!canChat}
                className="flex-1 border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={!canChat || !draft.trim()}
                className="px-3 py-1.5 text-sm rounded-full bg-blue-600 text-white disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
