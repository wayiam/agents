import React, { useState, useRef, useEffect } from 'react';

// Main application component
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // State to manage the active agent, defaults to the cooking assistant
  const [selectedAgent, setSelectedAgent] = useState('Cooking Assistant');
  const messagesEndRef = useRef(null);

  // Auto-scrolls the message container to the bottom when new messages are added.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Adds an initial greeting message when the component mounts.
  useEffect(() => {
    setMessages([
      {
        sender: 'agent',
        text: `Hello! I'm a multi-purpose assistant. You can select an agent from the left sidebar to specialize my responses. Let's start with the ${selectedAgent}.`,
      },
    ]);
  }, [selectedAgent]);

  // Handles the form submission and API call.
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add the user's message to the state immediately.
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: trimmedInput }]);
    setInput('');
    setIsLoading(true);

    try {
      // Send the user's query along with the selected agent to the backend API.
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: trimmedInput, selectedAgent: selectedAgent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // Add the agent's response to the state.
      setMessages((prevMessages) => [...prevMessages, { sender: 'agent', text: data.finalOutput }]);
    } catch (error) {
      console.error('Failed to fetch response:', error);
      // Display an error message to the user if the API call fails.
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'agent',
          text: 'Oops! I am having trouble connecting to the server. Please check your backend and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Renders a single chat bubble, styled differently for the user and agent.
  const MessageBubble = ({ sender, text }) => {
    const isUser = sender === 'user';
    const bubbleClasses = isUser
      ? 'bg-emerald-600 text-white rounded-tr-3xl rounded-bl-3xl'
      : 'bg-stone-200 text-stone-900 rounded-tl-3xl rounded-br-3xl';
    
    // A simple function to convert basic markdown to HTML
    const formatMarkdown = (markdownText) => {
      let html = markdownText
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>');

      const lines = html.split('\n');
      let inList = false;
      const formattedLines = lines.map((line) => {
        if (line.startsWith('- ')) {
          if (!inList) {
            inList = true;
            return `<ul><li>${line.substring(2)}</li>`;
          }
          return `<li>${line.substring(2)}</li>`;
        } else {
          if (inList) {
            inList = false;
            return `</ul><p>${line}</p>`;
          }
          return `<p>${line}</p>`;
        }
      });

      html = formattedLines.join('');
      if (inList) {
        html += '</ul>';
      }
      return html;
    };
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
        <div className={`p-4 max-w-lg shadow-lg ${bubbleClasses}`}>
          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-stone-100 text-stone-800 font-inter">
      {/* Sidebar for agent selection */}
      <div className="w-64 bg-white p-6 flex flex-col items-start border-r border-stone-200">
        <h2 className="text-xl font-bold mb-4">Select any Agent</h2>
        <button
          onClick={() => setSelectedAgent('Cooking Assistant')}
          className={`w-full text-left px-4 py-2 my-1 rounded-lg transition-colors duration-200 ${
            selectedAgent === 'Cooking Assistant'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-200 hover:bg-stone-300'
          }`}
        >
          Cooking Assistant
        </button>
        <button
          onClick={() => setSelectedAgent('Coding Assistant')}
          className={`w-full text-left px-4 py-2 my-1 rounded-lg transition-colors duration-200 ${
            selectedAgent === 'Coding Assistant'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-200 hover:bg-stone-300'
          }`}
        >
          Coding Assistant
        </button>
        <button
          onClick={() => setSelectedAgent('Weather Assistant')}
          className={`w-full text-left px-4 py-2 my-1 rounded-lg transition-colors duration-200 ${
            selectedAgent === 'Weather Assistant'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-200 hover:bg-stone-300'
          }`}
        >
          Weather Assistant
        </button>
        <button
          onClick={() => setSelectedAgent('Finance Assistant')}
          className={`w-full text-left px-4 py-2 my-1 rounded-lg transition-colors duration-200 ${
            selectedAgent === 'Finance Assistant'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-200 hover:bg-stone-300'
          }`}
        >
          Finance Assistant
        </button>
        <button
          onClick={() => setSelectedAgent('Language Translator')}
          className={`w-full text-left px-4 py-2 my-1 rounded-lg transition-colors duration-200 ${
            selectedAgent === 'Language Translator'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-200 hover:bg-stone-300'
          }`}
        >
          Language Translator
        </button>
      </div>

      {/* Main chat area */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <MessageBubble key={index} sender={msg.sender} text={msg.text} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-tl-3xl rounded-br-3xl bg-stone-200 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-stone-400 animate-pulse delay-75" />
                  <div className="w-2 h-2 rounded-full bg-stone-400 animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white border-t border-stone-200 flex items-center space-x-2 shadow-md"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`p-3 rounded-full transition-colors duration-200 ${
              isLoading
                ? 'bg-emerald-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
            }`}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
