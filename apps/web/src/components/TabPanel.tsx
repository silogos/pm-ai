import { useState } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabPanelProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function TabPanel({ tabs, defaultTab }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="detail-tabs-container">
      <div className="detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`detail-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="detail-tab-content">
        {activeContent}
      </div>
    </div>
  );
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  return (
    <div className="markdown-editor-container">
      <div className="markdown-editor-pane">
        <h4 className="editor-pane-title">Editor</h4>
        <textarea
          className="markdown-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Write markdown here...'}
        />
      </div>
      <div className="markdown-preview-pane">
        <h4 className="editor-pane-title">Preview</h4>
        <div className="markdown-preview">
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <span className="preview-placeholder">Nothing to preview</span>
          )}
        </div>
      </div>
    </div>
  );
}
