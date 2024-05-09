import { useEffect, useRef } from "react";

import { PrismaClient } from "@prisma/client";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import { format, parseISO, startOfWeek } from "date-fns";

export const meta: MetaFunction = () => {
  return [
    { title: "Work Journal" },
    {
      name: "description",
      content: "A journal of my work experiences and learnings.",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
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

  return db.entry.create({
    data: {
      type: category,
      date: new Date(date),
      text: text,
    },
  });
}

export async function loader() {
  const db = new PrismaClient();
  const entries = await db.entry.findMany();

  return entries.map((entry) => ({
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  }));
}

export default function Index() {
  const fetcher = useFetcher();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const entries = useLoaderData<typeof loader>();

  // console.log({ entries });

  let weeklyEntries = entries.reduce<Record<string, typeof entries>>(
    (memo, entry) => {
      let sunday = startOfWeek(parseISO(entry.date));
      let sundayString = format(sunday, "yyyy-MM-dd");

      memo[sundayString] ||= [];
      memo[sundayString].push(entry);

      return memo;
    },
    {}
  );

  let weekKeys = Object.keys(weeklyEntries)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      key,
      work: weeklyEntries[key].filter((entry) => entry.type === "work"),
      learning: weeklyEntries[key].filter((entry) => entry.type === "learning"),
      interesting: weeklyEntries[key].filter(
        (entry) => entry.type === "Interesting things"
      ),
    }));

  console.log({ entries });

  useEffect(() => {
    if (fetcher.state === "idle" && textAreaRef.current) {
      textAreaRef.current.value = "";
      textAreaRef.current.focus();
    }
  }, [fetcher.state]);

  console.log("check fetcher", {
    state: fetcher.state,
  });

  return (
    <div className="container mx-auto">
      <div className="p-4 space-y-4 border mb-5">
        <p>Create an entry</p>
        <fetcher.Form className="space-y-4" method="post">
          <fieldset
            className="disabled:opacity-50"
            disabled={fetcher.state === "submitting"}
          >
            <div>
              <input
                type="date"
                name="date"
                required
                className="text-gray-700"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div className="space-x-6 flex">
              <label className="flex items-center">
                <input
                  className="mr-2"
                  type="radio"
                  name="category"
                  value="work"
                  defaultChecked
                />
                Work
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  className="mr-2"
                  name="category"
                  value="learning"
                />
                Learning
              </label>
              <label className="flex items-center">
                <input
                  className="mr-2"
                  type="radio"
                  name="category"
                  value="Interesting things"
                />
                Interesting things
              </label>
            </div>
            <div>
              <textarea
                name="text"
                className="w-full p-2 text-black border"
                placeholder="Write about your activities"
                required
                ref={textAreaRef}
              />
            </div>
            <div>
              <button type="submit" className="p-2 text-white bg-blue-500">
                {fetcher.state === "submitting" ? "Saving..." : "Save"}
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>

      {weekKeys.map((week) => (
        <div key={week.key} className="p-4 space-y-4 border ">
          <p className="font-extrabold">
            Week of {format(parseISO(week.key), "MMMM do")}
          </p>

          <div>
            {week.learning.length > 0 && (
              <div>
                <h3>Learning</h3>
                <ul className="ml-8 list-disc">
                  {week.learning.map((entry) => (
                    <EntryListItem entry={entry} />
                  ))}
                </ul>
              </div>
            )}

            {week.work.length > 0 && (
              <div>
                <h3>Work</h3>
                <ul className="ml-8 list-disc">
                  {week.work.map((entry) => (
                    <EntryListItem entry={entry} />
                  ))}
                </ul>
              </div>
            )}

            {week.interesting.length > 0 && (
              <div>
                <h3>Interesting things</h3>
                <ul className="ml-8 list-disc">
                  {week.interesting.map((entry) => (
                    <EntryListItem entry={entry} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EntryListItem({
  entry,
}: {
  entry: Awaited<ReturnType<typeof loader>>[number];
}) {
  return (
    <li key={entry.id} className="group">
      {entry.text}
      <Link
        to={`/entries/${entry.id}/edit`}
        className="text-blue-500 ml-2 group-hover:underline "
      >
        Edit
      </Link>
    </li>
  );
}
