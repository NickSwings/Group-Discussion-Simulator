import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import SetupScreen from './components/SetupScreen';
import DiscussionRoom from './components/DiscussionRoom';
import { Participant, AI_PERSONALITIES } from './types';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'setup' | 'discussion'>('setup');
  const [topic, setTopic] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleStartDiscussion = (selectedTopic: string, count: number) => {
    // Generate User Participant
    const user: Participant = {
      id: 'user',
      name: 'You',
      role: 'Participant',
      isUser: true,
      avatarSeed: 0
    };

    // Generate AI Participants
    const aiParticipants: Participant[] = Array.from({ length: count }).map((_, i) => ({
      id: `ai-${i}`,
      name: AI_PERSONALITIES[i].name,
      role: AI_PERSONALITIES[i].role,
      isUser: false,
      avatarSeed: i + 1
    }));

    setTopic(selectedTopic);
    setParticipants([user, ...aiParticipants]);
    setScreen('discussion');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {screen === 'setup' && <SetupScreen onStart={handleStartDiscussion} />}
      {screen === 'discussion' && (
        <DiscussionRoom 
          topic={topic} 
          participants={participants} 
          onBack={() => setScreen('setup')}
        />
      )}
    </div>
  );
};

export default App;