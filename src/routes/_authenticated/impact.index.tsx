import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/impact/")({
  beforeLoad: () => {
    throw redirect({ to: "/impact/volunteer" });
  },
});
