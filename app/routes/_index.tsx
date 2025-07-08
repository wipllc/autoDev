import {
  type AppLoadContext,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
};

export function loader({ context }: LoaderFunctionArgs) {
  const cloudflareContext = context as AppLoadContext;
  return {
    message: cloudflareContext.cloudflare.env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Home({ loaderData }: { loaderData: any }) {
  return <div>Hello {loaderData.message}</div>;
}
