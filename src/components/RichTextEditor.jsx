import { useRef } from 'react';
import { Bold, Italic, Underline, List } from 'lucide-react';

/**
 * A lightweight Rich Text Editor using contentEditable and document.execCommand.
 * Outputs basic HTML string.
 */
export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  // Handle formatting commands
  const handleFormat = (e, command) => {
    e.preventDefault();
    document.execCommand(command, false, null);
    // Force focus back so user can keep typing
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-200 p-2">
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'bold')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded hover:text-gray-900 transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'italic')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded hover:text-gray-900 transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'underline')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded hover:text-gray-900 transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded hover:text-gray-900 transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[120px] max-h-[300px] overflow-y-auto prose prose-sm max-w-none focus:outline-none bg-white"
        dangerouslySetInnerHTML={{ __html: value === '' ? '' : undefined }}
      />
    </div>
  );
}
