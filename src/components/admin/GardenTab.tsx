import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listAllPosts, deletePost } from "@/lib/blog.functions";
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

/** Admin tab: list, create, edit, and delete digital-garden blog entries. */
export function GardenTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-garden"],
    queryFn: () => listAllPosts(),
  });

  const del = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await deletePost({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-garden"] });
  };

  return (
    <section>
      <SectionHeader
        title="Digital Garden"
        action={
          <Link to="/admin/garden/new" className={PRIMARY_BTN}>
            <Plus className="h-3.5 w-3.5" /> New entry
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
                    to="/admin/garden/$id"
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
              <div className="font-mono text-xs text-muted-foreground">
                {p.topic} · {p.published ? "published" : "draft"}
              </div>
            </AdminRow>
          ))}
        </AdminList>
      ) : (
        <EmptyState label="No garden entries yet." />
      )}
    </section>
  );
}
