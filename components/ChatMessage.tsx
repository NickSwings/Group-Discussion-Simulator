import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message, Participant } from '../types';

interface ChatMessageProps {
  message: Message;
  participant: Participant;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, participant }) => {
  const isUser = participant.isUser;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser 
            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' 
            : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300'
        }`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`
          relative p-4 rounded-2xl shadow-sm
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
          }
        `}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-xs font-bold ${isUser ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
              {participant.name}
            </span>
            <span className={`text-[10px] ${isUser ? 'text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>
               {participant.role}
            </span>
          </div>
          
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;