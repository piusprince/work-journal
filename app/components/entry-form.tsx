import { useRef, useEffect } from "react";

import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";

type EntryFormProps = {
  entry?: {
    id: number;
    date: string;
    type: string;
    text: string;
  };
};

const typeOptions = [
  { value: "work", label: "Work" },
  { value: "learning", label: "Learning" },
  { value: "Interesting things", label: "Interesting things" },
];

export default function EntryForm({ entry }: EntryFormProps) {
  const fetcher = useFetcher();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data === null &&
      textAreaRef.current
    ) {
      textAreaRef.current.value = "";
      textAreaRef.current.focus();
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form className="space-y-4" method="post">
      <fieldset
        className="disabled:opacity-50"
        disabled={fetcher.state !== "idle"}
      >
        <div>
          <input
            type="date"
            name="date"
            required
            className="text-gray-700"
            defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
          />
        </div>
        <div className="space-x-6 flex">
          {typeOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                className="mr-2"
                type="radio"
                name="category"
                value={option.value}
                defaultChecked={option.value === (entry?.type ?? "work")}
              />
              {option.label}
            </label>
          ))}
        </div>
        <div>
          <textarea
            name="text"
            className="w-full p-2 text-black border"
            placeholder="Write about your activities"
            required
            ref={textAreaRef}
            defaultValue={entry?.text}
          />
        </div>
        <div>
          <button type="submit" className="p-2 text-white bg-blue-500">
            {fetcher.state !== "idle" ? "Saving..." : "Save"}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
