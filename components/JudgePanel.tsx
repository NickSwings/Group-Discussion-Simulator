import React from 'react';
import { X, RefreshCw, Gavel } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface JudgePanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const JudgePanel: React.FC<JudgePanelProps> = ({ isOpen, onClose, content, isLoading, onRefresh }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
              <Gavel size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Judge's Verdict</h3>
              <p className="text-slate-400 text-xs">AI Evaluation of the debate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={onRefresh} 
                disabled={isLoading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
                title="Re-evaluate"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 text-slate-800 dark:text-slate-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400">
              <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
              <p>Analyzing arguments...</p>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none">
              <ReactMarkdown>{content || "No evaluation available."}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          Powered by Gemini 3 Pro
        </div>
      </div>
    </div>
  );
};

export default JudgePanel;