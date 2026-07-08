'use client';

import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxCharacters?: number;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Write something descriptive...',
  maxCharacters,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4 border border-border-color shadow-sm inline-block',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4 border border-border-color',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border-color bg-border-light dark:bg-bg-sidebar font-semibold p-2 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border-color p-2 text-left',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none p-0 my-3',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-1',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[220px] max-h-[500px] overflow-y-auto p-4 rounded-b-xl bg-bg-card border border-t-0 border-border-color text-text-primary',
        style: 'min-height: 250px;',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          uploadAndInsertImage(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              uploadAndInsertImage(file);
              return true;
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must not exceed 5MB');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/v1/community/uploads', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
        } else {
          alert(data.errors?.[0] || 'Image upload failed');
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('An error occurred during file upload');
      }
    },
    [editor]
  );

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAndInsertImage(e.target.files[0]);
    }
  };

  const addLink = () => {
    const url = prompt('Enter the link URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return (
      <div className="h-[300px] flex items-center justify-center border border-border-color bg-bg-card rounded-xl text-text-muted">
        <i className="fas fa-spinner fa-spin mr-2"></i> Initializing rich text editor...
      </div>
    );
  }

  const charCount = editor.getText().length;

  return (
    <div className="flex flex-col w-full text-text-primary">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-border-light dark:bg-bg-sidebar border border-border-color rounded-t-xl select-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('bold') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Bold"
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('italic') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Italic"
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('underline') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Underline"
        >
          <i className="fas fa-underline"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('strike') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Strikethrough"
        >
          <i className="fas fa-strikethrough"></i>
        </button>

        <span className="w-px h-6 bg-border-color mx-1"></span>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Heading 3"
        >
          H3
        </button>

        <span className="w-px h-6 bg-border-color mx-1"></span>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('bulletList') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Bullet List"
        >
          <i className="fas fa-list-ul"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('orderedList') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Ordered List"
        >
          <i className="fas fa-list-ol"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('taskList') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Task List"
        >
          <i className="fas fa-tasks"></i>
        </button>

        <span className="w-px h-6 bg-border-color mx-1"></span>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('blockquote') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Blockquote"
        >
          <i className="fas fa-quote-right"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('codeBlock') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Code Block"
        >
          <i className="fas fa-code"></i>
        </button>

        <span className="w-px h-6 bg-border-color mx-1"></span>

        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors ${editor.isActive('link') ? 'bg-border-color dark:bg-border-light font-bold text-color-primary' : 'text-text-secondary'}`}
          title="Link"
        >
          <i className="fas fa-link"></i>
        </button>
        <button
          type="button"
          onClick={triggerImageUpload}
          className="p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors text-text-secondary"
          title="Image"
        >
          <i className="fas fa-image"></i>
        </button>

        <span className="w-px h-6 bg-border-color mx-1"></span>

        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors text-text-secondary"
          title="Table"
        >
          <i className="fas fa-table"></i>
        </button>

        <span className="w-px h-6 bg-border-color mx-1"></span>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors text-text-secondary disabled:opacity-30 disabled:pointer-events-none"
          title="Undo"
        >
          <i className="fas fa-undo"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-border-color dark:hover:bg-border-light transition-colors text-text-secondary disabled:opacity-30 disabled:pointer-events-none"
          title="Redo"
        >
          <i className="fas fa-redo"></i>
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Stats / Counters */}
      <div className="flex justify-end gap-4 p-2 bg-border-light dark:bg-bg-sidebar border border-t-0 border-border-color rounded-b-xl text-xs text-text-muted select-none">
        <span>Characters: {charCount} {maxCharacters ? `/ ${maxCharacters}` : ''}</span>
      </div>
    </div>
  );
}
