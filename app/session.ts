import { createCookieSessionStorage } from "@remix-run/node";

export const { commitSession, getSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "work-journal-session",
      secrets: ["s3cr3t"],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    },
  });
