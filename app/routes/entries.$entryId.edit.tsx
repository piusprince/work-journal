import { PrismaClient } from "@prisma/client";
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import EntryForm from "~/components/entry-form";

export async function loader({ params }: LoaderFunctionArgs) {
  if (typeof params.entryId !== "string") {
    throw new Response("Entry ID not found", { status: 404 });
  }

  const db = new PrismaClient();

  const entry = await db.entry.findUnique({
    where: {
      id: +params.entryId,
    },
  });

  if (!entry) {
    throw new Response("Entry not found", { status: 404 });
  }

  return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (typeof params.entryId !== "string") {
    throw new Response("Entry ID not found", { status: 404 });
  }

  const db = new PrismaClient();

  const formData = await request.formData();
  const { _action, date, category, text } = Object.fromEntries(formData);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (_action === "delete") {
    await db.entry.delete({
      where: {
        id: +params.entryId,
      },
    });
    return redirect("/");
  } else {
    if (
      typeof date !== "string" ||
      typeof category !== "string" ||
      typeof text !== "string"
    ) {
      throw new Error("Invalid form data");
    }

    await db.entry.update({
      where: {
        id: +params.entryId,
      },
      data: {
        type: category,
        date: new Date(date),
        text: text,
      },
    });

    return redirect("/");
  }
}

export default function EditPage() {
  const entry = useLoaderData<typeof loader>();

  console.log({ entry });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      event.preventDefault();
    }
  };

  return (
    <>
      Edit
      <p>Editing entry {entry.id}</p>
      <EntryForm entry={entry} />
      <Form method="post" onSubmit={handleSubmit}>
        <button
          name="_action"
          value="delete"
          className="p-2 text-white bg-red-500"
        >
          Delete entry
        </button>
      </Form>
    </>
  );
}
