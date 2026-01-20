export interface Participant {
  id: string;
  name: string;
  role: string;
  voiceId: string; // For TTS
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

export const VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

export const AI_PERSONALITIES = [
  { name: 'Alice', role: 'The Optimist: Always sees the bright side and potential benefits.' },
  { name: 'Bob', role: 'The Skeptic: Questions assumptions and looks for flaws.' },
  { name: 'Charlie', role: 'The Analyst: Focuses on data, facts, and logical structure.' },
  { name: 'Diana', role: 'The Creative: Offers out-of-the-box ideas and emotional perspective.' },
  { name: 'Ethan', role: 'The Mediator: Tries to find common ground and synthesize views.' },
];
