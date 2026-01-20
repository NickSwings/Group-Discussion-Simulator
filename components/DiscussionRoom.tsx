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
  const [isJudgeOpen, setIsJudgeOpen] = useState(false);
  const [judgeContent, setJudgeContent] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ref for speech recognition
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initial welcome
    if (messages.length === 0) {
       // Start discussion
       triggerAIResponse([]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    
    // Trigger AI response loop
    await triggerAIResponse([...messages, newMessage]);
  };

  const triggerAIResponse = async (currentHistory: Message[]) => {
    setIsProcessing(true);
    try {
        const responses = await generateDiscussionResponse(topic, currentHistory, participants);
        
        let newHistory = [...currentHistory];
        
        // Add responses one by one with slight delay for effect
        for (const res of responses) {
            await new Promise(r => setTimeout(r, 800)); // Thinking delay
            const aiMsg: Message = {
                id: Date.now().toString() + Math.random(),
                participantId: res.participantId,
                text: res.text,
                timestamp: Date.now()
            };
            setMessages(prev => {
                newHistory = [...prev, aiMsg];
                return newHistory;
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
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
    <div className="flex flex-col h-screen bg-slate-100 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 leading-tight truncate max-w-md">{topic}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {participants.length} Participants Active
            </p>
          </div>
        </div>
        <button
          onClick={handleCallJudge}
          className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <Gavel size={16} />
          Call Judge
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            participant={participants.find(p => p.id === msg.participantId)!}
          />
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-slate-400 text-sm ml-4 animate-pulse">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-50 text-red-600 ring-2 ring-red-200 animate-pulse' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            placeholder="Type your argument..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            disabled={isProcessing}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-200"
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
