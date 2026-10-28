import { createFileRoute } from "@tanstack/react-router";
import { LobbyShell } from "@/components/lobby/LobbyShell";
import { SetupPanel } from "@/components/lobby/SetupPanel";

export const Route = createFileRoute("/vs-computer")({
  head: () => ({
    meta: [
      { title: "Play vs Computer – Ludo King" },
      { name: "description", content: "Set up a Play vs Computer Ludo match." },
      { property: "og:title", content: "Play vs Computer – Ludo King" },
      { property: "og:description", content: "Set up a Play vs Computer Ludo match." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LobbyShell showHome>
      <SetupPanel mode="computer" />
    </LobbyShell>
  ),
});
