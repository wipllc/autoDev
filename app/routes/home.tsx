import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome to Chat App" },
    { name: "description", content: "Real-time chat powered by Cloudflare Durable Objects" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <Welcome message={loaderData.message} />
      
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to the Chat Room! 💬
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Join our real-time chat room powered by Cloudflare Durable Objects. 
          Connect with others instantly and enjoy seamless communication.
        </p>
        
        <Link
          to="/chat"
          className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="mr-2">🚀</span>
          Join Chat Room
        </Link>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>✨ Real-time messaging</p>
          <p>📱 Mobile-friendly interface</p>
          <p>⚡ Powered by Cloudflare Workers</p>
        </div>
      </div>
    </div>
  );
}
