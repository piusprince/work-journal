import { useRef } from "react";

import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";
import { ActionFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

type EntryFormProps = {
  entry: {
    id: number;
    date: string;
    type: string;
    text: string;
  };
};

export default function EntryForm({ entry }: EntryFormProps) {
  const fetcher = useFetcher();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  console.log({ entry });

  return (
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
            defaultValue={entry.date}
          />
        </div>
        <div className="space-x-6 flex">
          <label className="flex items-center">
            <input
              className="mr-2"
              type="radio"
              name="category"
              value="work"
              defaultChecked={entry.type === "work"}
            />
            Work
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              className="mr-2"
              name="category"
              value="learning"
              defaultChecked={entry.type === "learning"}
            />
            Learning
          </label>
          <label className="flex items-center">
            <input
              className="mr-2"
              type="radio"
              name="category"
              value="Interesting things"
              defaultChecked={entry.type === "Interesting things"}
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
            defaultValue={entry.text}
          />
        </div>
        <div>
          <button type="submit" className="p-2 text-white bg-blue-500">
            {fetcher.state === "submitting" ? "Saving..." : "Save"}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
