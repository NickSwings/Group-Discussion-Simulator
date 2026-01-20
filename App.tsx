import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import DiscussionRoom from './components/DiscussionRoom';
import { Participant, AI_PERSONALITIES, VOICES } from './types';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'setup' | 'discussion'>('setup');
  const [topic, setTopic] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);

  const handleStartDiscussion = (selectedTopic: string, count: number) => {
    // Generate User Participant
    const user: Participant = {
      id: 'user',
      name: 'You',
      role: 'Participant',
      voiceId: '', // User doesn't need TTS
      isUser: true,
      avatarSeed: 0
    };

    // Generate AI Participants
    const aiParticipants: Participant[] = Array.from({ length: count }).map((_, i) => ({
      id: `ai-${i}`,
      name: AI_PERSONALITIES[i].name,
      role: AI_PERSONALITIES[i].role,
      voiceId: VOICES[i % VOICES.length],
      isUser: false,
      avatarSeed: i + 1
    }));

    setTopic(selectedTopic);
    setParticipants([user, ...aiParticipants]);
    setScreen('discussion');
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
