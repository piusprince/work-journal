import { PrismaClient } from "@prisma/client";
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import EntryForm from "~/components/entry-form";

export async function loader({ params }: LoaderFunctionArgs) {
  console.log({ params });

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

  console.log({ params });

  const db = new PrismaClient();

  const formData = await request.formData();
  const { date, category, text } = Object.fromEntries(formData);

  await new Promise((resolve) => setTimeout(resolve, 1000));

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

export default function EditPage() {
  const entry = useLoaderData<typeof loader>();

  console.log({ entry });

  return (
    <div>
      Edit
      <p>Editing entry {entry.id}</p>
      <EntryForm entry={entry} />
    </div>
  );
}
