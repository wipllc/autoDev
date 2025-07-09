import { createRequestHandler } from "react-router";
import { ChatRoom } from "./chatroom";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle chat WebSocket connections and API requests
    if (url.pathname.startsWith("/chat") || url.pathname.startsWith("/api")) {
      const roomId = url.searchParams.get("room") || "general";
      const durableObjectId = env.CHATROOM_DURABLE_OBJECT.idFromName(roomId);
      const durableObject = env.CHATROOM_DURABLE_OBJECT.get(durableObjectId);
      
      return durableObject.fetch(request);
    }
    
    // Handle all other requests with React Router
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;

export { ChatRoom };
