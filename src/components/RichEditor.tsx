"use client";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import { getSupabase } from "@/lib/supabase/client";

/** Rich-text editor for questions & solutions: formatting, lists, Match-the-List tables and images. */
export function RichEditor({ value, onChange, placeholder, hindi = false, compact = false }: {
  value: string; onChange: (html: string) => void; placeholder?: string; hindi?: boolean; compact?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [3, 4] } }),
      Underline, Subscript, Superscript,
      Table.configure({ resizable: false }), TableRow, TableHeader, TableCell,
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: { attributes: { class: `rich ${hindi ? "font-hindi" : ""} ${compact ? "!min-h-[60px]" : ""}` } },
  });

  // keep in sync when the form loads a different question
  const lastExternal = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value !== lastExternal.current && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    lastExternal.current = value;
  }, [value, editor]);

  return (
    <div className="overflow-hidden rounded-xl border border-maroon/15 bg-white focus-within:border-maroon focus-within:ring-2 focus-within:ring-maroon/10">
      {editor && <Toolbar editor={editor} compact={compact} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, compact }: { editor: Editor; compact: boolean }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const inTable = editor.isActive("table");

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
      const sb = getSupabase();
      const { error } = await sb.storage.from("question-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = sb.storage.from("question-images").getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl, alt: file.name }).run();
    } catch (e) {
      alert("Image upload failed: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const B = ({ on, label, title, act }: { on?: boolean; label: React.ReactNode; title: string; act: () => void }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={act}
      className={`min-w-[30px] rounded-md px-1.5 py-1 text-[13px] ${on ? "bg-maroon text-white" : "text-stone-700 hover:bg-maroon-50"}`}>{label}</button>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-maroon/10 bg-maroon-50/40 px-1.5 py-1">
      <B title="Bold" label={<b>B</b>} on={editor.isActive("bold")} act={() => editor.chain().focus().toggleBold().run()} />
      <B title="Italic" label={<i>I</i>} on={editor.isActive("italic")} act={() => editor.chain().focus().toggleItalic().run()} />
      <B title="Underline" label={<u>U</u>} on={editor.isActive("underline")} act={() => editor.chain().focus().toggleUnderline().run()} />
      <B title="Subscript" label={<span>x<sub>2</sub></span>} on={editor.isActive("subscript")} act={() => editor.chain().focus().toggleSubscript().run()} />
      <B title="Superscript" label={<span>x<sup>2</sup></span>} on={editor.isActive("superscript")} act={() => editor.chain().focus().toggleSuperscript().run()} />
      {!compact && (
        <>
          <span className="mx-1 h-5 w-px bg-maroon/15" />
          <B title="Numbered list (statements)" label="1." on={editor.isActive("orderedList")} act={() => editor.chain().focus().toggleOrderedList().run()} />
          <B title="Bullet list" label="•" on={editor.isActive("bulletList")} act={() => editor.chain().focus().toggleBulletList().run()} />
          <span className="mx-1 h-5 w-px bg-maroon/15" />
          <B title="Insert Match List-I / List-II table" label="⊞ Table" act={() => editor.chain().focus().insertTable({ rows: 5, cols: 2, withHeaderRow: true }).run()} />
          {inTable && (
            <>
              <B title="Add row below" label="+Row" act={() => editor.chain().focus().addRowAfter().run()} />
              <B title="Add column right" label="+Col" act={() => editor.chain().focus().addColumnAfter().run()} />
              <B title="Delete row" label="−Row" act={() => editor.chain().focus().deleteRow().run()} />
              <B title="Delete column" label="−Col" act={() => editor.chain().focus().deleteColumn().run()} />
              <B title="Delete table" label="✕Table" act={() => editor.chain().focus().deleteTable().run()} />
            </>
          )}
          <span className="mx-1 h-5 w-px bg-maroon/15" />
          <B title="Upload image" label={uploading ? "…" : "🖼 Image"} act={() => fileRef.current?.click()} />
          <B title="Image from URL" label="🔗" act={() => { const u = prompt("Image URL (https://…)"); if (u && /^https:\/\//.test(u)) editor.chain().focus().setImage({ src: u }).run(); }} />
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        </>
      )}
      <span className="flex-1" />
      <B title="Undo" label="↶" act={() => editor.chain().focus().undo().run()} />
      <B title="Redo" label="↷" act={() => editor.chain().focus().redo().run()} />
    </div>
  );
}
