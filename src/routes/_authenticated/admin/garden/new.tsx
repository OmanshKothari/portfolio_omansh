import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell, PageHeader } from "@/components/portfolio/Shell";
import { BlogForm } from "./$id";

export const Route = createFileRoute("/_authenticated/admin/garden/new")({
  head: () => ({ meta: [{ title: "New garden entry" }, { name: "robots", content: "noindex" }] }),
  component: NewGardenPage,
});

function NewGardenPage() {
  const navigate = useNavigate();
  return (
    <Shell>
      <PageHeader eyebrow="Admin" title="New garden entry" />
      <BlogForm initial={null} onDone={() => navigate({ to: "/admin" })} />
    </Shell>
  );
}
