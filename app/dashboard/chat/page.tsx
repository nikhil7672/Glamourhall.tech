import React, { useState } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = { text: input.trim(), sender: 'user' };
      setMessages([...messages, newMessage]);
      setInput('');

      // Simulate a bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: `Bot: ${newMessage.text}`, sender: 'bot' },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 shadow-lg rounded-lg w-full h-full max-w-md">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white py-4 px-6 text-lg font-bold rounded-t-lg">
        Chat with AI
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="flex items-center bg-white p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
