import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { Bold, Italic, Code, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Undo, Redo } from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-portfolio min-h-[280px] max-w-none px-4 py-3 text-sm text-foreground focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    label,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    label: string;
    children: ReactNodeLike;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:bg-accent hover:text-foreground " +
        (active ? "bg-accent text-foreground" : "")
      }
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1">
        <Btn label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn label="Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
          <Code className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn label="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
          <Heading1 className="h-4 w-4" />
        </Btn>
        <Btn label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="h-4 w-4" />
        </Btn>
        <Btn label="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote className="h-4 w-4" />
        </Btn>
        <Btn
          label="Link"
          onClick={() => {
            const prev = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("URL", prev ?? "https://");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
        >
          <LinkIcon className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </Btn>
        <Btn label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

type ReactNodeLike = React.ReactNode;
