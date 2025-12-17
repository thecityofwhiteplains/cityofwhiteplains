"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Extension } from "@tiptap/core";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string | null) => ReturnType;
    };
  }
}

const LineHeight = Extension.create({
  name: "lineHeight",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "listItem"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => (element as HTMLElement).style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string | null) =>
        (ctx: { commands: any }) => {
          const { commands } = ctx;
          const next = lineHeight && lineHeight.trim().length > 0 ? lineHeight : null;
          return (
            commands.updateAttributes("paragraph", { lineHeight: next }) &&
            commands.updateAttributes("heading", { lineHeight: next }) &&
            commands.updateAttributes("listItem", { lineHeight: next })
          );
        },
    } as any;
  },
});

function ToolbarButton({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-[10px] font-semibold transition",
        active
          ? "border-[#111827] bg-[#111827] text-white"
          : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function BlogRichTextEditor({ value, onChange, placeholder }: Props) {
  const lastHtmlRef = useRef<string>("");
  const [textColor, setTextColor] = useState("#111827");
  const [lineHeight, setLineHeight] = useState("1.6");

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class:
              "my-3 rounded-xl bg-[#0B1020] px-4 py-3 font-mono text-[12px] text-[#E5E7EB] overflow-x-auto",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "my-3 border-l-4 border-[#E5E7EB] pl-4 text-[#374151] italic",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-[#4B5FC6] underline underline-offset-2",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "my-3 w-full rounded-2xl border border-[#E5E7EB] object-cover",
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        HTMLAttributes: { class: "rounded bg-yellow-100 px-1" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      LineHeight,
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[240px] rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] leading-relaxed text-[#111827] outline-none focus:border-[#4B5FC6]",
        "data-placeholder": placeholder || "",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastHtmlRef.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    if (next === lastHtmlRef.current) return;
    if (next === editor.getHTML()) return;
    editor.commands.setContent(next, false);
    lastHtmlRef.current = next;
  }, [value, editor]);

  function promptForLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL (https://…)", previousUrl || "https://");
    if (url === null) return;
    if (url.trim().length === 0) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function promptForImage() {
    if (!editor) return;
    const url = window.prompt("Image URL (https://…)", "https://");
    if (!url || url.trim().length === 0) return;
    editor.chain().focus().setImage({ src: url.trim(), alt: "" }).run();
  }

  function applyTextColor(nextColor: string) {
    if (!editor) return;
    setTextColor(nextColor);
    editor.chain().focus().setColor(nextColor).run();
  }

  function applyLineHeight(next: string) {
    if (!editor) return;
    setLineHeight(next);
    editor.chain().focus().setLineHeight(next).run();
  }

  if (!editor) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[11px] text-[#6B7280]">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
        <ToolbarButton
          label="B"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="U"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton
          label="• List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1. List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={promptForLink} />
        <ToolbarButton label="Image" onClick={promptForImage} />
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton
          label="Code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
        <ToolbarButton
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          label="HR"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton
          label="H1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="P"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton
          label="Align L"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarButton
          label="Align C"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarButton
          label="Align R"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />
        <div className="h-5 w-px bg-[#E5E7EB]" />

        <label className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] font-semibold text-[#4B5563]">
          Color
          <input
            type="color"
            value={textColor}
            onChange={(e) => applyTextColor(e.target.value)}
            className="h-5 w-8 cursor-pointer border border-[#D1D5DB] bg-white p-0"
            aria-label="Pick text color"
          />
        </label>

        <label className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] font-semibold text-[#4B5563]">
          Line spacing
          <select
            value={lineHeight}
            onChange={(e) => applyLineHeight(e.target.value)}
            className="rounded-md border border-[#D1D5DB] bg-white px-2 py-1 text-[10px] text-[#111827] outline-none"
          >
            <option value="1.2">Tight</option>
            <option value="1.4">Compact</option>
            <option value="1.6">Normal</option>
            <option value="1.8">Relaxed</option>
            <option value="2.0">Loose</option>
          </select>
        </label>

        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        />
        <ToolbarButton
          label="Clear"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />
      </div>

      <EditorContent editor={editor} />

      <p className="text-[10px] text-[#9CA3AF]">
        Saves as HTML. Use Link and Image to embed URLs. Code block supports pasted code.
      </p>
    </div>
  );
}
