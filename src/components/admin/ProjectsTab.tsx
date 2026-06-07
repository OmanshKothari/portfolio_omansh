import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listProjects, deleteProject } from "@/lib/projects.functions";
import { TableSkeletonList } from "@/components/skeletons/TableSkeletons";
import {
  AdminList,
  AdminRow,
  DeleteButton,
  EditIcon,
  EmptyState,
  SectionHeader,
} from "./primitives";
import { PRIMARY_BTN, editLinkClass } from "./styles";

/** Admin tab: list, create, edit, and delete portfolio projects. */
export function ProjectsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => listProjects(),
  });

  const del = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await deleteProject({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  };

  return (
    <section>
      <SectionHeader
        title="Projects"
        action={
          <Link to="/admin/projects/new" className={PRIMARY_BTN}>
            <Plus className="h-3.5 w-3.5" /> New project
          </Link>
        }
      />
      {isLoading ? (
        <TableSkeletonList count={5} />
      ) : data && data.length > 0 ? (
        <AdminList>
          {data.map((p) => (
            <AdminRow
              key={p.id}
              actions={
                <>
                  <Link
                    to="/admin/projects/$id"
                    params={{ id: p.id }}
                    className={editLinkClass}
                    aria-label="Edit"
                  >
                    <EditIcon />
                  </Link>
                  <DeleteButton onClick={() => del(p.id)} />
                </>
              }
            >
              <div className="text-sm font-medium text-foreground">{p.title}</div>
              <div className="truncate font-mono text-xs text-muted-foreground">/{p.slug}</div>
            </AdminRow>
          ))}
        </AdminList>
      ) : (
        <EmptyState label="No projects yet." />
      )}
    </section>
  );
}
