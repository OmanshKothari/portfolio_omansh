import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { ProjectsTab } from "@/components/admin/ProjectsTab";
import { GardenTab } from "@/components/admin/GardenTab";
import { TimelineTab } from "@/components/admin/TimelineTab";
import { MessagesTab } from "@/components/admin/MessagesTab";
import { ProfileTab } from "@/components/admin/ProfileTab";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

type Tab = "projects" | "garden" | "timeline" | "messages" | "profile";

// Tab definitions: id (used in state) + the label shown on the button.
const TABS: { id: Tab; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "garden", label: "Digital Garden" },
  { id: "timeline", label: "Timeline" },
  { id: "messages", label: "Messages" },
  { id: "profile", label: "Profile" },
];

// Each tab id maps to the component rendered when it is active.
const TAB_CONTENT: Record<Tab, React.ComponentType> = {
  projects: ProjectsTab,
  garden: GardenTab,
  timeline: TimelineTab,
  messages: MessagesTab,
  profile: ProfileTab,
};

function AdminHome() {
  const [tab, setTab] = useState<Tab>("projects");
  const ActiveTab = TAB_CONTENT[tab];

  return (
    <Shell>
      <PageHeader
        eyebrow="Admin"
        title="Manage content"
        description="Create, edit, and remove projects, garden entries, timeline items, messages, and your profile."
      />
      <TabBar active={tab} onChange={setTab} />
      <ActiveTab />
    </Shell>
  );
}

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={
            "border-b-2 px-3 py-2 text-sm font-medium transition-colors " +
            (active === id
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground")
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
