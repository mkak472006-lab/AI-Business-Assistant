import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function AIChat() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
 const [copiedIndex, setCopiedIndex] = useState(null);
const [activeTool, setActiveTool] = useState(null);
const [searchQuery, setSearchQuery] = useState("");
const messagesEndRef = useRef(null);

  const createNewConversation = () => {
    return {
      id: Date.now(),
      title: "New Conversation",
      messages: [
        {
          role: "assistant",
          text: "Hello! I'm your AI Business Assistant. How can I help you today?"
        }
      ]
    };
  };

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("aiBusinessConversations");

    if (saved) {
      return JSON.parse(saved);
    }

    return [createNewConversation()];
  });

  const [activeConversationId, setActiveConversationId] = useState(
    () => {
      const saved = localStorage.getItem(
        "aiBusinessActiveConversation"
      );

      if (saved) {
        return Number(saved);
      }

      return null;
    }
  );

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  useEffect(() => {
    localStorage.setItem(
      "aiBusinessConversations",
      JSON.stringify(conversations)
    );
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(
        "aiBusinessActiveConversation",
        activeConversationId
      );
    }
   
  }, [activeConversationId]);

  const activeConversation = conversations.find(
    (conversation) =>
      conversation.id === activeConversationId
  );

  const messages = useMemo(
  () => (activeConversation ? activeConversation.messages : []),
  [activeConversation]
);
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth"
  });
}, [messages, loading]);

  const quickTools = [
    "Write an Email",
    "Social Media Post",
    "Product Description",
    "Freelancing Proposal",
    "Business Idea"
  ];

  const handleQuickTool = (tool) => {
  setActiveTool(tool);
  setMessage("");
};



  const handleNewChat = () => {
    const newConversation = createNewConversation();

    setConversations((previous) => [
      newConversation,
      ...previous
    ]);

    setActiveConversationId(newConversation.id);
    setMessage("");
  };

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    setMessage("");
  };

  const handleDeleteConversation = (id) => {
    const confirmed = window.confirm(
  "Are you sure you want to delete this conversation?"
);

if (!confirmed) {
  return;
}
    const remaining = conversations.filter(
      (conversation) => conversation.id !== id
    );

    if (remaining.length === 0) {
      const newConversation = createNewConversation();

      setConversations([newConversation]);
      setActiveConversationId(newConversation.id);
      return;
    }

    setConversations(remaining);

    if (id === activeConversationId) {
      setActiveConversationId(remaining[0].id);
    }
  };
  const handleClearAllChats = () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete all conversations?"
  );

  if (!confirmed) {
    return;
  }

  const newConversation = createNewConversation();

  setConversations([newConversation]);
  setActiveConversationId(newConversation.id);
  setMessage("");
};
const handleRegenerate = async () => {
  if (loading || !activeConversation) {
    return;
  }

  const previousMessages = activeConversation.messages.filter(
    (msg) => msg.role !== "assistant"
  );

  setLoading(true);

  try {
    const response = await axios.post(
      "https://ai-business-assistant-rx39.onrender.com//api/chat",
      {
        messages: previousMessages
      }
    );

    setConversations((previous) =>
      previous.map((conversation) => {
        if (conversation.id !== activeConversationId) {
          return conversation;
        }

        return {
          ...conversation,
          messages: [
            ...previousMessages,
            {
              role: "assistant",
              text: response.data.reply
            }
          ]
        };
      })
    );
  } catch (error) {
    console.error(error);
  }

  setLoading(false);
};
const handleAIAction = async (instruction) => {
  if (loading || !activeConversation) {
    return;
  }

  const currentMessages = activeConversation.messages;

  const lastAIMessage =
    [...currentMessages]
      .reverse()
      .find((msg) => msg.role === "assistant");

  if (!lastAIMessage) {
    return;
  }

  const prompt = `${instruction}

Here is the AI response:
${lastAIMessage.text}`;

  setLoading(true);

  try {
    const response = await axios.post(
      "https://ai-business-assistant-rx39.onrender.com//api/chat",
      {
        messages: [
          {
            role: "user",
            text: prompt
          }
        ]
      }
    );

    setConversations((previous) =>
      previous.map((conversation) => {
        if (conversation.id !== activeConversationId) {
          return conversation;
        }

        return {
          ...conversation,
          messages: [
            ...currentMessages,
            {
              role: "assistant",
              text: response.data.reply
            }
          ]
        };
      })
    );
  } catch (error) {
    console.error(error);
  }

  setLoading(false);
};

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading || !activeConversation) {
      return;
    }

    const userMessage = message.trim();

    const updatedMessages = [
      ...activeConversation.messages,
      {
        role: "user",
        text: userMessage
      }
    ];

    setConversations((previous) =>
      previous.map((conversation) => {
        if (conversation.id !== activeConversationId) {
          return conversation;
        }

        return {
  ...conversation,
  title:
    conversation.title === "New Conversation"
      ? userMessage.slice(0, 30) +
        (userMessage.length > 30 ? "..." : "")
      : conversation.title,
  messages: updatedMessages,
  updatedAt: new Date().toISOString()
};
      })
    );

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://ai-business-assistant-rx39.onrender.com//api/chat",
        {
          messages: updatedMessages
        }
      );

      setConversations((previous) =>
        previous.map((conversation) => {
          if (conversation.id !== activeConversationId) {
            return conversation;
          }

          return {
  ...conversation,
  messages: [
    ...updatedMessages,
    {
      role: "assistant",
      text: response.data.reply
    }
  ],
  updatedAt: new Date().toISOString()
};
        })
      );
    } catch (error) {
      console.error(error);

      setConversations((previous) =>
        previous.map((conversation) => {
          if (conversation.id !== activeConversationId) {
            return conversation;
          }

          return {
            ...conversation,
            messages: [
              ...updatedMessages,
              {
                role: "assistant",
                text: "Sorry, I couldn't connect to the AI server."
              }
            ]
          };
        })
      );
    }

    setLoading(false);
  };

  return (
    <div className="ai-layout">

      {/* SIDEBAR */}

      <aside className="chat-sidebar">

  <div className="sidebar-brand">
    <div className="brand-icon">✦</div>

    <div>
      <h2>AI Business</h2>
      <span>Assistant</span>
    </div>
  </div>

  <button
    className="sidebar-new-chat"
    onClick={handleNewChat}
  >
    <span>＋</span>
    New Chat
  </button>

  <div className="history-title">
    RECENT CHATS
  </div>
  <div className="chat-search">
  <span>🔍</span>

  <input
    type="text"
    placeholder="Search chats..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div> 

  <div className="conversation-list">

    {conversations
  .filter((conversation) =>
    conversation.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )
  .map((conversation) => (
      <div
        key={conversation.id}
        className={`conversation-item ${
          conversation.id === activeConversationId
            ? "active-conversation"
            : ""
        }`}
        onClick={() =>
          handleSelectConversation(conversation.id)
        }
      >

        <span className="chat-icon">💬</span>

        <div className="conversation-title">
  {conversation.title}
</div>

<button
  className="rename-chat"
  onClick={(e) => {
    e.stopPropagation();

    const newTitle = prompt(
      "Enter a new name for this conversation:",
      conversation.title
    );

    if (!newTitle || !newTitle.trim()) {
      return;
    }

    setConversations((previous) =>
      previous.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              title: newTitle.trim()
            }
          : item
      )
    );
  }}
>
  ✎
</button>

        <button
          className="delete-chat"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteConversation(conversation.id);
          }}
        >
          ×
        </button>

      </div>
    ))}

  </div>

  <div className="sidebar-bottom">

  <div
    className="sidebar-option"
    onClick={handleClearAllChats}
  >
    🗑️
    <span>Clear All Chats</span>
  </div>

    <div className="sidebar-version">
      AI Business Assistant v1.0
    </div>

  </div>

</aside>

      {/* MAIN AREA */}

      <main className="ai-main">

        <div className="ai-header">

          <div>
            <h1>AI Business Assistant</h1>
            <p>Your smart assistant for business tasks</p>
          </div>

          <div className="status">
            <span></span>
            Online
          </div>

        </div>

        <div className="chat-container">

          <div className="quick-tools">

            {quickTools.map((tool) => (
              <button
                key={tool}
                onClick={() => handleQuickTool(tool)}
                disabled={loading}
              >
                {tool}
              </button>
            ))}

          </div>
          {activeTool && (
  <div className="tool-panel">

    <div className="tool-panel-header">
      <div>
        <h3>{activeTool}</h3>
        <p>Give a few details and I'll create it for you.</p>
      </div>

      <button
        className="tool-close"
        onClick={() => setActiveTool(null)}
      >
        ×
      </button>
    </div>

    <div className="tool-fields">

      <input
        type="text"
        placeholder={
          activeTool === "Write an Email"
            ? "Email purpose"
            : activeTool === "Social Media Post"
            ? "Post topic"
            : activeTool === "Product Description"
            ? "Product name"
            : activeTool === "Freelancing Proposal"
            ? "Project name"
            : "Business type or idea"
        }
        id="toolInput"
      />

      <button
        className="tool-generate"
        onClick={() => {
          const input =
            document.getElementById("toolInput").value;

          if (!input.trim()) {
            return;
          }

          const prompts = {
            "Write an Email":
              `Write a professional business email about: ${input}`,

            "Social Media Post":
              `Create an engaging social media post about: ${input}`,

            "Product Description":
              `Write a professional product description for: ${input}`,

            "Freelancing Proposal":
              `Write a professional freelancing proposal for this project: ${input}`,

            "Business Idea":
              `Give me 3 realistic business ideas related to: ${input}`
          };

          setMessage(prompts[activeTool]);
          setActiveTool(null);
        }}
      >
        Generate
      </button>

    </div>

  </div>
)}

          <div className="messages">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.role === "user"
                    ? "user-message"
                    : "ai-message"
                }`}
              >

                <div className="message-label">
  {msg.role === "user" ? (
    "You"
  ) : (
    <>
      <span className="ai-mini-logo">✦</span>
      AI Assistant
    </>
  )}
</div>

                <div className="message-text">

                  {msg.role === "assistant" ? (
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}

                </div>

                {msg.role === "assistant" && (
  <div className="ai-actions">

    <button
      className="copy-btn"
      onClick={() =>
        handleCopy(msg.text, index)
      }
    >
      {copiedIndex === index
        ? "✓ Copied"
        : "📋 Copy"}
    </button>

    <button
      className="copy-btn"
      onClick={handleRegenerate}
      disabled={loading}
    >
      🔄 Regenerate
    </button>
<button
  className="copy-btn"
  onClick={() =>
    handleAIAction(
      "Make this response shorter while keeping the important information."
    )
  }
  disabled={loading}
>
  ✂️ Make Shorter
</button>
<button
  className="copy-btn"
  onClick={() =>
    handleAIAction(
      "Rewrite this response in a professional and polished business tone."
    )
  }
  disabled={loading}
>
  💼 Professional
</button>
<button
  className="copy-btn"
  onClick={() =>
    handleAIAction(
      "Rewrite this response using very simple language so a beginner can easily understand it."
    )
  }
  disabled={loading}
>
  💡 Explain Simpler
</button>
  </div>
)}

              </div>
            ))}

            {loading && (
              <div className="message ai-message">

                <div className="message-label">
                  AI Assistant
                </div>
              <div ref={messagesEndRef} />
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>
            )}

          </div>

          <form
            className="chat-input"
            onSubmit={handleSend}
          >

            <input
              type="text"
              placeholder={
                loading
                  ? "AI is thinking..."
                  : "Ask something about your business..."
              }
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Thinking..." : "Send"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default AIChat;