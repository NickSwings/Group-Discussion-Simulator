import React, { useState } from 'react';
import { Volume2, User, Bot } from 'lucide-react';
import { Message, Participant } from '../types';
import { playTextToSpeech } from '../services/geminiService';

interface ChatMessageProps {
  message: Message;
  participant: Participant;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, participant }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await playTextToSpeech(message.text, participant.voiceId);
    setIsPlaying(false);
  };

  const isUser = participant.isUser;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`
          relative p-4 rounded-2xl shadow-sm
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
          }
        `}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-xs font-bold ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
              {participant.name}
            </span>
            <span className={`text-[10px] ${isUser ? 'text-indigo-300' : 'text-slate-400'}`}>
               {participant.role}
            </span>
          </div>
          
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          
          {/* TTS Button */}
          {!isUser && (
            <button
              onClick={handlePlayAudio}
              className="absolute -right-8 bottom-0 p-1.5 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Read Aloud"
            >
              <Volume2 size={16} className={isPlaying ? "animate-pulse text-indigo-600" : ""} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
