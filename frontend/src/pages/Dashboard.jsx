import React from "react";

function Dashboard({ conversations }) {
  const totalConversations = conversations.length;

  const totalMessages = conversations.reduce(
    (total, conversation) =>
      total + conversation.messages.filter(
        (message) => message.role === "user"
      ).length,
    0
  );

  const totalAIResponses = conversations.reduce(
    (total, conversation) =>
      total + conversation.messages.filter(
        (message) => message.role === "assistant"
      ).length,
    0
  );
  const toolNames = [
  "Write an Email",
  "Social Media Post",
  "Product Description",
  "Freelancing Proposal",
  "Business Idea"
];

const toolUsage = toolNames.map((tool) => ({
  name: tool,
  count: conversations.reduce(
    (total, conversation) =>
      total +
      conversation.messages.filter(
        (message) =>
          message.role === "user" &&
          message.text.toLowerCase().includes(tool.toLowerCase())
      ).length,
    0
  )
}));

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <div>
          <h1>Business Dashboard</h1>
          <p>Overview of your AI assistant activity</p>
        </div>
      </div>

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <span className="dashboard-icon">💬</span>
          <div>
            <p>Total Conversations</p>
            <h2>{totalConversations}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-icon">👤</span>
          <div>
            <p>Your Messages</p>
            <h2>{totalMessages}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-icon">🤖</span>
          <div>
            <p>AI Responses</p>
            <h2>{totalAIResponses}</h2>
          </div>
        </div>

      </div>
<div className="dashboard-section">
  <h2>Most Used Tools</h2>

  <div className="tool-usage-list">
    {toolUsage.map((tool) => (
      <div
        className="tool-usage-item"
        key={tool.name}
      >
        <span>{tool.name}</span>
        <strong>{tool.count}</strong>
      </div>
    ))}
  </div>
</div>
      <div className="dashboard-section">
        <h2>Recent Activity</h2>

        {conversations.length === 0 ? (
          <p className="empty-dashboard">
            No conversations yet.
          </p>
        ) : (
          conversations.slice(0, 5).map((conversation) => (
            <div
              className="activity-item"
              key={conversation.id}
            >
              <span>💬</span>

              <div>
                <strong>{conversation.title}</strong>
                <p>
  {conversation.messages.length} messages
  {conversation.updatedAt && (
    <>
      {" • "}
      {new Date(conversation.updatedAt).toLocaleString()}
    </>
  )}
</p>
              </div>
            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default Dashboard;