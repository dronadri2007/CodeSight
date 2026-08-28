import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as MonacoType from 'monaco-editor';
import { useApp } from '../../context/AppContext';

interface MonacoCodeEditorProps {
  code: string;
  language: string;
  selectedLines: number[];
  onToggleLine: (lineNumber: number) => void;
  readOnly?: boolean;
  height?: string;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  language,
  selectedLines,
  onToggleLine,
  readOnly = true,
  height = "100%"
}) => {
  const { theme } = useApp();
  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof MonacoType | null>(null);
  const decorationsRef = useRef<string[]>([]);

  // Map language aliases
  const monacoLanguage = language.toLowerCase() === 'python' ? 'python' : 'typescript';

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom dark theme matching CodeSight Obsidian Palette
    monaco.editor.defineTheme('codesight-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c0c1ff', fontStyle: 'bold' },
        { token: 'string', foreground: 'a3e635' },
        { token: 'number', foreground: 'ffb786' },
        { token: 'type', foreground: 'adc6ff' },
        { token: 'function', foreground: '60a5fa' }
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#dae2fd',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#adc6ff',
        'editor.lineHighlightBackground': '#1e293b50',
        'editorGutter.background': '#0b1120',
        'editor.selectionBackground': '#4d8eff40',
        'editorCursor.foreground': '#adc6ff'
      }
    });

    // Define custom light theme
    monaco.editor.defineTheme('codesight-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '4f46e5', fontStyle: 'bold' },
        { token: 'string', foreground: '15803d' },
        { token: 'number', foreground: 'c2410c' },
        { token: 'type', foreground: '2563eb' },
        { token: 'function', foreground: '0284c7' }
      ],
      colors: {
        'editor.background': '#f8fafc',
        'editor.foreground': '#0f172a',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#2563eb',
        'editor.lineHighlightBackground': '#e2e8f050',
        'editorGutter.background': '#f1f5f9',
        'editor.selectionBackground': '#3b82f630',
        'editorCursor.foreground': '#2563eb'
      }
    });

    monaco.editor.setTheme(theme === 'dark' ? 'codesight-dark' : 'codesight-light');

    // Handle mouse down on line numbers or code to toggle selection
    editor.onMouseDown((e) => {
      if (e.target && e.target.position) {
        const lineNumber = e.target.position.lineNumber;
        if (lineNumber && lineNumber > 0) {
          onToggleLine(lineNumber);
        }
      }
    });

    // Anti-cheating friction: prevent context menu in editor
    editor.onContextMenu((e) => {
      e.event.preventDefault();
    });
  };

  // Sync theme
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'codesight-dark' : 'codesight-light');
    }
  }, [theme]);

  // Update line selection decorations
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const monaco = monacoRef.current;
    const editor = editorRef.current;

    const newDecorations: MonacoType.editor.IModelDeltaDecoration[] = selectedLines.map((line) => ({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'monaco-selected-line-bg',
        glyphMarginClassName: 'monaco-selected-glyph',
        linesDecorationsClassName: 'monaco-selected-gutter',
        overviewRuler: {
          color: theme === 'dark' ? '#adc6ff' : '#2563eb',
          position: monaco.editor.OverviewRulerLane.Full
        }
      }
    }));

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [selectedLines, theme]);

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      <style>{`
        .monaco-selected-line-bg {
          background-color: ${theme === 'dark' ? 'rgba(77, 142, 255, 0.22)' : 'rgba(37, 99, 235, 0.15)'} !important;
          border-left: 3px solid ${theme === 'dark' ? '#adc6ff' : '#2563eb'} !important;
        }
        .monaco-selected-gutter {
          background-color: ${theme === 'dark' ? '#adc6ff' : '#2563eb'};
          width: 4px !important;
        }
      `}</style>
      <Editor
        height={height}
        language={monacoLanguage}
        value={code}
        onMount={handleEditorDidMount}
        options={{
          readOnly: readOnly,
          domReadOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 24,
          fontFamily: "'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          glyphMargin: false,
          folding: false,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          renderLineHighlight: 'none',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8
          },
          wordWrap: 'on',
          contextmenu: false,
          cursorStyle: 'line',
          padding: { top: 16, bottom: 16 }
        }}
        loading={
          <div className="flex items-center justify-center h-full text-on-surface-variant font-mono text-sm">
            Initializing Code Review Environment...
          </div>
        }
      />
    </div>
  );
};
