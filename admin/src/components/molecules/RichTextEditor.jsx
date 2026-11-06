import { forwardRef, useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import { Button, Divider, Input, Popover, Select } from 'antd';
import {
    BoldOutlined,
    ItalicOutlined,
    LinkOutlined,
    OrderedListOutlined,
    StrikethroughOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';

const HEADING_OPTIONS = [
    { value: 'p', label: 'Paragraph' },
    ...[1, 2, 3, 4, 5, 6].map((l) => ({ value: `h${l}`, label: `Heading ${l}` })),
];

function HeadingSelect({ editor }) {
    let current = 'p';
    for (let l = 1; l <= 6; l += 1) {
        if (editor.isActive('heading', { level: l })) current = `h${l}`;
    }

    const onChange = (val) => {
        const chain = editor.chain().focus();
        if (val === 'p') chain.setParagraph().run();
        else chain.setHeading({ level: Number(val.slice(1)) }).run();
    };

    return (
        <Select
            value={current}
            options={HEADING_OPTIONS}
            onChange={onChange}
            // Borderless so the parent Form.Item's error state doesn't turn
            // this select red — the editor frame already shows validation.
            variant="borderless"
            style={{ width: 136 }}
            className="shrink-0 rounded-md! hover:bg-gray-100!"
            popupMatchSelectWidth={false}
        />
    );
}

// Deliberately limited — the toolbar (and the extensions behind it) expose
// bold, italic, strike, links, headings (h1–h6) and bullet/numbered lists, so
// admins can't produce other markup the public pages aren't designed to render.
const buildExtensions = (placeholder) => [
    StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        underline: false,
        link: {
            openOnClick: false,
            autolink: true,
            linkOnPaste: true,
            HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        },
    }),
    TextStyle,
    FontSize,
    Placeholder.configure({ placeholder: placeholder || '' }),
];

const SIZE_OPTIONS = [
    { value: '', label: 'Default' },
    ...[12, 14, 16, 18, 20, 24, 28, 32, 40].map((s) => ({ value: `${s}px`, label: `${s}px` })),
];

function SizeSelect({ editor }) {
    // Text without an explicit size (plain paragraphs, headings) used to show
    // "Default" here, which looked like the size had been reset. Show the size
    // it is actually rendered at instead.
    let current = editor.getAttributes('textStyle').fontSize || '';
    if (!current) {
        try {
            const { node } = editor.view.domAtPos(editor.state.selection.from);
            const el = node.nodeType === 3 ? node.parentElement : node;
            if (el) current = `${Math.round(parseFloat(getComputedStyle(el).fontSize))}px`;
        } catch {
            current = '';
        }
    }

    const options = SIZE_OPTIONS.some((o) => o.value === current) || !current
        ? SIZE_OPTIONS
        : [...SIZE_OPTIONS, { value: current, label: current }];

    const onChange = (val) => {
        const chain = editor.chain().focus();
        if (val) chain.setFontSize(val).run();
        else chain.unsetFontSize().run();
    };

    return (
        <Select
            value={current}
            options={options}
            onChange={onChange}
            variant="borderless"
            style={{ width: 96 }}
            className="shrink-0 rounded-md! hover:bg-gray-100!"
            popupMatchSelectWidth={false}
            title="Text size"
        />
    );
}

// forwardRef matters here, not just for style: antd's Popover (used by
// LinkButton below) clones its trigger child and attaches a ref to it to
// find the real DOM node for positioning. Without forwarding that ref to the
// underlying <Button>, the popover can never resolve a position and stays
// parked off-screen — it wouldn't be a cosmetic gap, it'd never appear.
const ToolbarButton = forwardRef(function ToolbarButton({ active, icon, title, onClick }, ref) {
    return (
        <Button
            ref={ref}
            type="text"
            icon={icon}
            title={title}
            className={
                'w-9! h-9! flex! items-center! justify-center! rounded-md! border! ' +
                (active
                    ? 'bg-primary-light! text-primary! border-primary-light!'
                    : 'text-gray-600 border-transparent! hover:bg-gray-100! hover:text-gray-900!')
            }
            // Prevents the button click from blurring the editor before the
            // command runs, which would otherwise drop the text selection.
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
        />
    );
});

// Works two ways: with text selected, the URL is applied as a link on that
// selection; with nothing selected, the URL itself is inserted as the link
// text (so there's always something to click, even over an empty cursor).
function LinkButton({ editor }) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');

    const { empty, from, to } = editor.state.selection;
    const selectedText = empty ? '' : editor.state.doc.textBetween(from, to, ' ');
    const isEditingLink = editor.isActive('link');

    const applyLink = () => {
        const trimmed = url.trim();
        if (!trimmed) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            setOpen(false);
            return;
        }
        const href = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
        if (empty) {
            editor
                .chain()
                .focus()
                .insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
                .run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
        }
        setOpen(false);
    };

    const confirmLabel = !url.trim() ? 'Remove' : isEditingLink ? 'Update' : empty ? 'Insert' : 'Add';

    return (
        <Popover
            open={open}
            trigger="click"
            placement="bottom"
            onOpenChange={(next) => {
                if (next) setUrl(editor.getAttributes('link').href ?? '');
                setOpen(next);
            }}
            content={
                <div className="w-72" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
                    <div className="text-sm font-medium text-gray-800 mb-1">
                        {isEditingLink ? 'Edit link' : 'Insert link'}
                    </div>
                    <div className="text-xs text-gray-500 mb-2 leading-snug">
                        {isEditingLink ? (
                            'Change or remove the URL for this link.'
                        ) : selectedText ? (
                            <>
                                Applies to "<span className="font-medium text-gray-700">{selectedText}</span>"
                            </>
                        ) : (
                            'No text selected — the URL itself will be inserted as the link.'
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onPressEnter={applyLink}
                            autoFocus
                            className="flex-1"
                        />
                        <Button type="primary" onClick={applyLink}>
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            }
        >
            <ToolbarButton
                active={isEditingLink}
                icon={<LinkOutlined />}
                title="Add link — select text first to link it, or leave nothing selected to insert a URL"
                onClick={() => {}}
            />
        </Popover>
    );
}

function Toolbar({ editor }) {
    return (
        <div className="flex flex-wrap items-center justify-start gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-[7px]">
            <HeadingSelect editor={editor} />
            <SizeSelect editor={editor} />
            <Divider orientation="vertical" className="mx-1.5! h-6!" />
            <ToolbarButton
                active={editor.isActive('bold')}
                icon={<BoldOutlined />}
                title="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
                active={editor.isActive('italic')}
                icon={<ItalicOutlined />}
                title="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
                active={editor.isActive('strike')}
                icon={<StrikethroughOutlined />}
                title="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <Divider orientation="vertical" className="mx-1.5! h-6!" />
            <ToolbarButton
                active={editor.isActive('bulletList')}
                icon={<UnorderedListOutlined />}
                title="Bullet list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
                active={editor.isActive('orderedList')}
                icon={<OrderedListOutlined />}
                title="Numbered list"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <Divider orientation="vertical" className="mx-1.5! h-6!" />
            <LinkButton editor={editor} />
        </div>
    );
}

// Controlled like a plain form input: `value` is HTML in, `onChange` is HTML
// out. Antd's Form.Item feeds both automatically when this is used as the
// child of a named Form.Item.
export default function RichTextEditor({ value, onChange, placeholder }) {
    const editor = useEditor({
        extensions: buildExtensions(placeholder),
        content: value || '',
        editorProps: {
            attributes: { class: 'rich-text-editor-content' },
        },
        onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
    });

    // Forces the button/link states in the toolbar to re-render on every
    // selection or content change (Tiptap doesn't trigger React state itself).
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!editor) return undefined;
        const rerender = () => setTick((t) => t + 1);
        editor.on('selectionUpdate', rerender);
        editor.on('transaction', rerender);
        return () => {
            editor.off('selectionUpdate', rerender);
            editor.off('transaction', rerender);
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="rounded-lg border border-gray-300 bg-white overflow-hidden transition-shadow focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--color-primary-light)]">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} className="px-5 py-4 min-h-56 max-h-[480px] overflow-y-auto" />
        </div>
    );
}
