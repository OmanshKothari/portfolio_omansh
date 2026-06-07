import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import type { TimelineItem } from "@/lib/portfolio-types";
import { listTimeline, deleteTimelineItem } from "@/lib/timeline.functions";
import { TableSkeletonList } from "@/components/skeletons/TableSkeletons";
import { TimelineForm } from "./TimelineForm";
import {
  AdminList,
  AdminRow,
  DeleteButton,
  EditButton,
  EmptyState,
  SectionHeader,
} from "./primitives";
import { PRIMARY_BTN } from "./styles";

/** Admin tab: list timeline items and open the modal form to create/edit them. */
export function TimelineTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-timeline"],
    queryFn: () => listTimeline(),
  });
  const [editing, setEditing] = useState<TimelineItem | null>(null);
  const [creating, setCreating] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-timeline"] });

  const del = async (id: string) => {
    if (!confirm("Delete this timeline item?")) return;
    await deleteTimelineItem({ data: { id } });
    invalidate();
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <section>
      <SectionHeader
        title="Timeline"
        action={
          <button onClick={() => setCreating(true)} className={PRIMARY_BTN}>
            <Plus className="h-3.5 w-3.5" /> New entry
          </button>
        }
      />
      {isLoading ? (
        <TableSkeletonList count={5} />
      ) : data && data.length > 0 ? (
        <AdminList>
          {data.map((t) => (
            <AdminRow
              key={t.id}
              actions={
                <>
                  <EditButton onClick={() => setEditing(t)} />
                  <DeleteButton onClick={() => del(t.id)} />
                </>
              }
            >
              <div className="text-sm font-medium text-foreground">{t.company}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {t.dates} · {t.role}
              </div>
            </AdminRow>
          ))}
        </AdminList>
      ) : (
        <EmptyState label="No timeline items yet." />
      )}

      {(creating || editing) && (
        <TimelineForm
          initial={editing}
          onClose={closeForm}
          onSaved={() => {
            invalidate();
            closeForm();
          }}
        />
      )}
    </section>
  );
}
