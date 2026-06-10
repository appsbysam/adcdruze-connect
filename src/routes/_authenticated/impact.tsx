import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { HeartHandshake, Gift } from "lucide-react";

export const Route = createFileRoute("/_authenticated/impact")({
  head: () => ({
    meta: [
      { title: "Community Impact — ADC" },
      { name: "description", content: "Volunteer your time or donate to support the Australian Druze Community." },
    ],
  }),
  component: ImpactLayout,
});

function ImpactLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onDonate = pathname.startsWith("/impact/donate") || pathname === "/impact/history";

  return (
    <div className="p-5 space-y-5">
      <header className="pt-2">
        <p className="text-xs uppercase tracking-wider text-[color:var(--brand-home)] font-semibold">Community Impact</p>
        <h1 className="text-2xl font-bold">Give back to ADC</h1>
        <p className="text-sm text-muted-foreground mt-1">Volunteer your time or contribute to causes that matter.</p>
      </header>

      <div className="grid grid-cols-2 gap-2 bg-muted/60 p-1 rounded-2xl">
        <Link
          to="/impact/volunteer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{
            backgroundColor: !onDonate ? "var(--brand-home)" : "transparent",
            color: !onDonate ? "white" : "var(--brand-home)",
          }}
        >
          <HeartHandshake className="size-4" /> Volunteer
        </Link>
        <Link
          to="/impact/donate"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{
            backgroundColor: onDonate ? "#C9A227" : "transparent",
            color: onDonate ? "white" : "#7A6212",
          }}
        >
          <Gift className="size-4" /> Donate
        </Link>
      </div>

      <Outlet />
    </div>
  );
}
