import { cssBundleHref } from "@remix-run/css-bundle";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import styles from "~/tailwind.css";
import { destroySession, getSession } from "./session";
import { PrismaClient } from "@prisma/client/extension";

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [{ rel: "stylesheet", href: cssBundleHref }]
    : [{ rel: "stylesheet", href: styles }]),
];

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  return {
    session,
  };
}

export default function App() {
  const { session } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="mb-5">
          <nav className="flex justify-between">
            <h1 className="mb-4 text-5xl font-bold">Work Journal</h1>

            {session.data.isAdmin ? (
              <Form method="post">
                <button>Logout</button>
              </Form>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </nav>
          <p className="text-gray-500">
            This is a journal of my work experiences and learnings. Updated
            everyday with weekly summaries.
          </p>
        </div>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
