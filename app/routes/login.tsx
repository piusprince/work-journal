import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/session";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { email, password } = Object.fromEntries(formData);

  if (email !== "test@test.com" || password === "test") {
    const session = await getSession();
    session.set("isAdmin", true);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    return {
      isAdmin: false,
    };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  console.log({ session: session.data });

  return session.data;
}

export default function Login() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      {data?.isAdmin ? (
        <Link to="/">Go to dashboard</Link>
      ) : (
        <Form method="post">
          <input type="email" name="email" placeholder="Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button type="submit" className="p-2 text-white bg-blue-500">
            Login
          </button>
        </Form>
      )}
    </div>
  );
}
