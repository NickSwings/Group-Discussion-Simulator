import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Gavel, ArrowLeft } from 'lucide-react';
import { Message, Participant } from '../types';
import ChatMessage from './ChatMessage';
import { generateDiscussionResponse, generateJudgeEvaluation } from '../services/geminiService';
import JudgePanel from './JudgePanel';

interface DiscussionRoomProps {
  topic: string;
  participants: Participant[];
  onBack: () => void;
}

const DiscussionRoom: React.FC<DiscussionRoomProps> = ({ topic, participants, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isJudgeOpen, setIsJudgeOpen] = useState(false);
  const [judgeContent, setJudgeContent] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial startup - Let everyone introduce themselves or start debate
  useEffect(() => {
    if (messages.length === 0) {
       triggerRoundRobin([]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeSpeakerId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const user = participants.find(p => p.isUser);
    if (!user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      participantId: user.id,
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Start the cycle for AI participants
    await triggerRoundRobin([...messages, newMessage]);
  };

  const triggerRoundRobin = async (initialHistory: Message[]) => {
    setIsProcessing(true);
    let currentHistory = [...initialHistory];
    const aiParticipants = participants.filter(p => !p.isUser);

    try {
      // Loop through EACH AI participant to form a "Full Circle"
      for (const participant of aiParticipants) {
        // 1. Thinking Phase (5-10 seconds)
        setActiveSpeakerId(participant.id);
        const delay = 5000 + Math.random() * 5000; // 5000ms to 10000ms
        await new Promise(resolve => setTimeout(resolve, delay));

        // 2. Generate Response
        const responseText = await generateDiscussionResponse(
          topic, 
          currentHistory, 
          participants, 
          participant
        );

        if (responseText) {
          const aiMsg: Message = {
            id: Date.now().toString() + Math.random(),
            participantId: participant.id,
            text: responseText,
            timestamp: Date.now()
          };

          setMessages(prev => {
            currentHistory = [...prev, aiMsg];
            return currentHistory;
          });
        }
      }
    } catch (e) {
      console.error("Error in round robin:", e);
    } finally {
      setActiveSpeakerId(null);
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech error", event);
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleCallJudge = async () => {
    setIsJudgeOpen(true);
    if (!judgeContent) {
        const evalText = await generateJudgeEvaluation(topic, messages, participants);
        setJudgeContent(evalText);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm px-6 py-4 flex items-center justify-between z-10 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-md">{topic}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {participants.length} Participants Active
            </p>
          </div>
        </div>
        <button
          onClick={handleCallJudge}
          className="bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-amber-200 dark:border-amber-800"
        >
          <Gavel size={16} />
          Call Judge
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            participant={participants.find(p => p.id === msg.participantId)!}
          />
        ))}
        
        {/* Thinking Indicator */}
        {activeSpeakerId && (
          <div className="flex w-full justify-start mb-4 animate-fade-in-up">
             <div className="flex max-w-[80%] flex-row items-end gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-200 dark:bg-slate-800 text-slate-400">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-3 rounded-2xl rounded-bl-none text-sm italic border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                   <span>
                      {participants.find(p => p.id === activeSpeakerId)?.name} is thinking...
                   </span>
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   </div>
                </div>
             </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-2 ring-red-200 dark:ring-red-900 animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Voice Input"
          >
            <Mic size={20} />
          </button>
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isProcessing ? "Wait for everyone to speak..." : "Type your argument..."}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Judge Overlay */}
      <JudgePanel
        isOpen={isJudgeOpen}
        onClose={() => setIsJudgeOpen(false)}
        content={judgeContent}
        isLoading={!judgeContent}
        onRefresh={async () => {
             setJudgeContent(null);
             const evalText = await generateJudgeEvaluation(topic, messages, participants);
             setJudgeContent(evalText);
        }}
      />
    </div>
  );
};

export default DiscussionRoom;