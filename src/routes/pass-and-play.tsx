import { createFileRoute } from "@tanstack/react-router";
import { LobbyShell } from "@/components/lobby/LobbyShell";
import { SetupPanel } from "@/components/lobby/SetupPanel";

export const Route = createFileRoute("/pass-and-play")({
  head: () => ({
    meta: [
      { title: "Pass N Play – Ludo King" },
      { name: "description", content: "Set up a Pass N Play Ludo match." },
      { property: "og:title", content: "Pass N Play – Ludo King" },
      { property: "og:description", content: "Set up a Pass N Play Ludo match." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LobbyShell showHome>
      <SetupPanel mode="local" />
    </LobbyShell>
  ),
});
