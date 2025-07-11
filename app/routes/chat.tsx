import { useState, useEffect, useRef, useMemo } from "react";
import type { Route } from "./+types/chat";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface WebSocketMessage {
  type: "history" | "new_message" | "user_joined";
  message?: ChatMessage;
  messages?: ChatMessage[];
  username?: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat Room" },
    { name: "description", content: "Real-time chat room powered by Cloudflare Durable Objects" },
  ];
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = (username: string) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/chat?username=${encodeURIComponent(username)}&room=general`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        if (data.type === "history" && data.messages) {
          setMessages(data.messages);
        } else if (data.type === "new_message" && data.message) {
          setMessages(prev => [...prev, data.message!]);
        } else if (data.type === "user_joined" && data.username) {
          // Could show a notification that user joined
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  };

  const joinChat = () => {
    if (username.trim()) {
      setHasJoined(true);
      connectWebSocket(username.trim());
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: "message",
        message: newMessage.trim()
      }));
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (hasJoined) {
        sendMessage();
      } else {
        joinChat();
      }
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const connectionStatus = useMemo(() => {
    if (!hasJoined) return "";
    return isConnected ? "🟢 Connected" : "🔴 Disconnected";
  }, [hasJoined, isConnected]);

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Chat Room</h1>
            <p className="text-gray-600">Enter your username to join the conversation</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                maxLength={50}
              />
            </div>
            
            <button
              onClick={joinChat}
              disabled={!username.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-lg"
            >
              Join Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Chat Room</h1>
            <p className="text-sm text-gray-600">Welcome, {username}!</p>
          </div>
          <div className="text-sm text-gray-600">
            {connectionStatus}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation! 👋</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.username === username ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-4 py-3 ${
                    message.username === username
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                >
                  {message.username !== username && (
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      {message.username}
                    </p>
                  )}
                  <p className="break-words">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.username === username ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                maxLength={1000}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-2xl transition duration-200"
            >
              <span className="hidden sm:inline">Send</span>
              <span className="sm:hidden">➤</span>
            </button>
          </div>
          
          {!isConnected && (
            <p className="text-red-500 text-sm mt-2 text-center">
              Disconnected. Please refresh the page to reconnect.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}