'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
    value: string;
    language: string;
    onChange: (value: string | undefined) => void;
    theme?: string;
    readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
    value, 
    language, 
    onChange, 
    theme = 'vs-dark',
    readOnly = false
}) => {
    const editorRef = useRef<any>(null);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        
        // Define a custom theme that matches SARTHI branding
        monaco.editor.defineTheme('tt-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
                { token: 'keyword', foreground: '50fa7b' },
                { token: 'string', foreground: 'f1fa8c' },
            ],
            colors: {
                'editor.background': '#0D1117',
                'editor.foreground': '#E6EDF3',
                'editor.lineHighlightBackground': '#161B22',
                'editorLineNumber.foreground': '#6E7681',
                'editorIndentGuide.background': '#21262D',
            }
        });
        
        monaco.editor.setTheme('tt-dark');
    };

    return (
        <div className="w-full h-full min-h-[300px] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
            <Editor
                height="100%"
                language={language}
                value={value}
                theme={theme === 'vs-dark' ? 'tt-dark' : theme}
                onMount={handleEditorDidMount}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: readOnly,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                }}
            />
        </div>
    );
};

