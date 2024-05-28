import { PrismaClient } from "@prisma/client";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { format, parseISO, startOfWeek } from "date-fns";
import EntryForm from "~/components/entry-form";
import { getSession } from "~/session";

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

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));

  const db = new PrismaClient();
  const entries = await db.entry.findMany();

  return {
    session,
    entries: entries.map((entry) => ({
      ...entry,
      date: entry.date.toISOString().substring(0, 10),
    })),
  };
}

export default function Index() {
  const { entries, session } = useLoaderData<typeof loader>();

  const weeklyEntries = entries.reduce<Record<string, typeof entries>>(
    (memo, entry) => {
      const sunday = startOfWeek(parseISO(entry.date));
      const sundayString = format(sunday, "yyyy-MM-dd");

      memo[sundayString] ||= [];
      memo[sundayString].push(entry);

      return memo;
    },
    {}
  );

  const weekKeys = Object.keys(weeklyEntries)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      key,
      work: weeklyEntries[key].filter((entry) => entry.type === "work"),
      learning: weeklyEntries[key].filter((entry) => entry.type === "learning"),
      interesting: weeklyEntries[key].filter(
        (entry) => entry.type === "Interesting things"
      ),
    }));

  console.log({ session });

  return (
    <div className="container mx-auto">
      {session.data.isAdmin && (
        <>
          <div className="p-4 space-y-4 border mb-5">
            <p>Create an entry</p>
            <EntryForm />
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
                      {week.learning.map((entry, index) => (
                        <EntryListItem entry={entry} key={index} />
                      ))}
                    </ul>
                  </div>
                )}

                {week.work.length > 0 && (
                  <div>
                    <h3>Work</h3>
                    <ul className="ml-8 list-disc">
                      {week.work.map((entry, index) => (
                        <EntryListItem entry={entry} key={index} />
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
        </>
      )}
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
