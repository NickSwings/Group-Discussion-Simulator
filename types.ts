export interface Participant {
  id: string;
  name: string;
  role: string;
  isUser: boolean;
  avatarSeed: number;
}

export interface Message {
  id: string;
  participantId: string;
  text: string;
  timestamp: number;
}

export interface AppState {
  screen: 'setup' | 'discussion' | 'judge';
  topic: string;
  participants: Participant[];
  messages: Message[];
  isJudgeAnalysisOpen: boolean;
  judgeAnalysis: string | null;
}

export const AI_PERSONALITIES = [
  { name: 'Alice', role: 'The Optimist: Always sees the bright side and potential benefits.' },
  { name: 'Bob', role: 'The Skeptic: Questions assumptions and looks for flaws.' },
  { name: 'Charlie', role: 'The Analyst: Focuses on data, facts, and logical structure.' },
  { name: 'Diana', role: 'The Creative: Offers out-of-the-box ideas and emotional perspective.' },
  { name: 'Ethan', role: 'The Mediator: Tries to find common ground and synthesize views.' },
  { name: 'Fiona', role: 'The Realist: Focuses on practical implementation and constraints.' },
  { name: 'George', role: 'The Historian: Provides context from past events and precedents.' },
  { name: 'Hannah', role: 'The Empathetic: Considers the human element and social impact.' },
  { name: 'Ian', role: 'The Visionary: Looks at long-term future possibilities.' },
];