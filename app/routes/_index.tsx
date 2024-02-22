import { useEffect, useRef } from "react";

import { PrismaClient } from "@prisma/client";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useFetcher } from "@remix-run/react";
import { format } from "date-fns";

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

export default function Index() {
  const fetcher = useFetcher();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
    <div>
      <h1 className="mb-4 text-3xl font-bold">Work Journal</h1>
      <p>
        This is a journal of my work experiences and learnings. Updated everyday
        with weekly summaries.
      </p>

      <div className="p-4 space-y-4 border ">
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
                {fetcher.state === "submitting" ? "Save..." : "Save"}
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>
    </div>
  );
}
