import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import type { ContactMessage } from "@/lib/portfolio-types";
import {
  listContactMessages,
  deleteContactMessage,
  markContactMessageRead,
} from "@/lib/contact.functions";
import { TableSkeletonList } from "@/components/skeletons/TableSkeletons";
import { DeleteButton, EmptyState, SectionHeader } from "./primitives";

/** Format an ISO timestamp as a human-readable local date and time. */
function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
}

/** A single contact-message card. */
function MessageCard({
  msg,
  onToggleRead,
  onDelete,
}: {
  msg: ContactMessage;
  onToggleRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-foreground">{msg.name}</div>
            {!msg.read && <span className="inline-block h-2 w-2 rounded-full bg-primary" />}
          </div>
          <div className="font-mono text-xs text-muted-foreground">{msg.email}</div>
          <p className="mt-2 text-sm text-foreground">{msg.message}</p>
          <div className="mt-2 font-mono text-xs text-muted-foreground">
            {formatTimestamp(msg.created_at)}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleRead}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={msg.read ? "Mark as unread" : "Mark as read"}
            title={msg.read ? "Mark as unread" : "Mark as read"}
          >
            <Mail className="h-4 w-4" />
          </button>
          <DeleteButton onClick={onDelete} />
        </div>
      </div>
    </div>
  );
}

/** Admin tab: view, mark read/unread, and delete contact-form submissions. */
export function MessagesTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => listContactMessages(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-messages"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContactMessage({ data: { id } }),
    onSuccess: invalidate,
  });

  const readMutation = useMutation({
    mutationFn: (vars: { id: string; read: boolean }) => markContactMessageRead({ data: vars }),
    onSuccess: invalidate,
  });

  const handleDelete = (id: string) => {
    if (!confirm("Delete this message?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <section>
      <SectionHeader title="Contact Messages" />
      {isLoading ? (
        <TableSkeletonList count={5} />
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((msg) => (
            <MessageCard
              key={msg.id}
              msg={msg}
              onToggleRead={() => readMutation.mutate({ id: msg.id, read: !msg.read })}
              onDelete={() => handleDelete(msg.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState label="No messages yet." />
      )}
    </section>
  );
}
