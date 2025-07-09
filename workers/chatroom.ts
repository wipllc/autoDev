export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export class ChatRoom implements DurableObject {
  private storage: DurableObjectStorage;
  private sessions: Map<WebSocket, { username: string }> = new Map();
  private messages: ChatMessage[] = [];

  constructor(state: DurableObjectState) {
    this.storage = state.storage;
    this.loadMessages();
  }

  private async loadMessages() {
    const stored = await this.storage.get<ChatMessage[]>("messages");
    if (stored) {
      this.messages = stored;
    }
  }

  private async saveMessages() {
    await this.storage.put("messages", this.messages);
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    
    if (upgradeHeader === "websocket") {
      return this.handleWebSocketUpgrade(request);
    }

    const url = new URL(request.url);
    
    if (url.pathname === "/api/messages" && request.method === "GET") {
      return new Response(JSON.stringify(this.messages), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }

  private handleWebSocketUpgrade(request: Request): Response {
    const url = new URL(request.url);
    const username = url.searchParams.get("username");
    
    if (!username) {
      return new Response("Username required", { status: 400 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.sessions.set(server, { username });

    server.accept();
    server.addEventListener("message", (event) => {
      this.handleMessage(server, event.data);
    });

    server.addEventListener("close", () => {
      this.sessions.delete(server);
    });

    // Send recent messages to new connection
    const recentMessages = this.messages.slice(-50); // Last 50 messages
    server.send(JSON.stringify({
      type: "history",
      messages: recentMessages
    }));

    // Broadcast user joined
    this.broadcast({
      type: "user_joined",
      username
    }, server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async handleMessage(sender: WebSocket, data: string) {
    try {
      const parsed = JSON.parse(data);
      const session = this.sessions.get(sender);
      
      if (!session) return;

      if (parsed.type === "message") {
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          username: session.username,
          message: parsed.message,
          timestamp: Date.now()
        };

        this.messages.push(message);
        
        // Keep only last 1000 messages
        if (this.messages.length > 1000) {
          this.messages = this.messages.slice(-1000);
        }

        await this.saveMessages();

        // Broadcast to all connected clients
        this.broadcast({
          type: "new_message",
          message
        });
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  private broadcast(data: any, except?: WebSocket) {
    const message = JSON.stringify(data);
    
    for (const [socket] of this.sessions) {
      if (socket !== except && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(message);
        } catch (error) {
          console.error("Error sending message:", error);
          this.sessions.delete(socket);
        }
      }
    }
  }
}