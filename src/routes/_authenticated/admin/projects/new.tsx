import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { ProjectForm } from "./$id";

export const Route = createFileRoute("/_authenticated/admin/projects/new")({
  head: () => ({ meta: [{ title: "New project" }, { name: "robots", content: "noindex" }] }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();
  return (
    <Shell>
      <PageHeader eyebrow="Admin" title="New project" />
      <ProjectForm initial={null} onDone={() => navigate({ to: "/admin" })} />
    </Shell>
  );
}
