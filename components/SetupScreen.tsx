import React, { useState } from 'react';
import { Users, Sparkles, MessageSquare } from 'lucide-react';
import { suggestTopic } from '../services/geminiService';

interface SetupScreenProps {
  onStart: (topic: string, participantCount: number) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [participantCount, setParticipantCount] = useState(2);
  const [topic, setTopic] = useState('');
  const [loadingTopic, setLoadingTopic] = useState(false);

  const handleSuggestTopic = async () => {
    setLoadingTopic(true);
    const suggested = await suggestTopic();
    setTopic(suggested);
    setLoadingTopic(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Group Discussion Simulator</h1>
          <p className="text-slate-500 dark:text-slate-400">Sharpen your debating skills with AI participants.</p>
        </div>

        <div className="space-y-6">
          {/* Participant Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Number of AI Participants
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="9"
                value={participantCount}
                onChange={(e) => setParticipantCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 w-8">{participantCount}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Plus you, making a group of {participantCount + 1}.
            </p>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Discussion Topic
            </label>
            <div className="relative">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic or ask AI to suggest one..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition-all resize-none h-24 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button
                onClick={handleSuggestTopic}
                disabled={loadingTopic}
                className="absolute right-2 bottom-2 p-2 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
              >
                {loadingTopic ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <Sparkles size={14} /> Suggest
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => {
              if (topic.trim()) onStart(topic, participantCount);
            }}
            disabled={!topic.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Users size={20} />
            Start Discussion
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;