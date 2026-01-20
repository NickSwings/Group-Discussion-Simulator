import { GoogleGenAI, Type } from "@google/genai";
import { Message, Participant } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: Audio Decoding ---
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext
): Promise<AudioBuffer> => {
  // We need to copy the buffer because decodeAudioData detaches it
  const bufferCopy = data.buffer.slice(0);
  return await ctx.decodeAudioData(bufferCopy);
};

// --- API Functions ---

export const suggestTopic = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Suggest a thought-provoking, controversial, or open-ended topic for a group discussion. Output ONLY the topic sentence, nothing else.",
      config: {
        maxOutputTokens: 50,
      }
    });
    return response.text?.trim() || "The impact of AI on creative professions.";
  } catch (error) {
    console.error("Error suggesting topic:", error);
    return "Is remote work good for society?";
  }
};

export const generateDiscussionResponse = async (
  topic: string,
  messages: Message[],
  participants: Participant[]
): Promise<{ participantId: string; text: string }[]> => {
  const aiParticipants = participants.filter(p => !p.isUser);
  const user = participants.find(p => p.isUser);
  
  // Format history for the prompt
  const historyText = messages.map(m => {
    const p = participants.find(p => p.id === m.participantId);
    return `${p?.name || 'Unknown'}: ${m.text}`;
  }).join('\n');

  const participantDescriptions = aiParticipants.map(p => 
    `- Name: ${p.name}, Personality/Role: ${p.role} (ID: ${p.id})`
  ).join('\n');

  const systemPrompt = `
    You are simulating a group discussion. 
    Topic: "${topic}"
    
    The user (${user?.name || 'User'}) is participating.
    The AI participants are:
    ${participantDescriptions}

    Here is the discussion so far:
    ${historyText}

    Task:
    Generate the next contribution(s) to the discussion. 
    You can generate 1 or 2 responses from different AI participants if it makes sense for the flow (e.g., a quick back-and-forth).
    Do not let the same person speak twice in a row unless they are interrupted.
    Keep responses concise (under 50 words) and conversational.
    Maintain the assigned personalities.
    
    Output JSON format:
    Array of objects: [ { "participantId": "string", "text": "string" } ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              participantId: { type: Type.STRING },
              text: { type: Type.STRING }
            },
            required: ["participantId", "text"]
          }
        }
      }
    });

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating discussion:", error);
    return [];
  }
};

export const generateJudgeEvaluation = async (topic: string, messages: Message[], participants: Participant[]): Promise<string> => {
  const historyText = messages.map(m => {
    const p = participants.find(p => p.id === m.participantId);
    return `${p?.name} (${p?.role || 'User'}): ${m.text}`;
  }).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for better reasoning
      contents: `
        You are an impartial and expert Judge of a debate/discussion.
        Topic: ${topic}
        
        Transcript:
        ${historyText}
        
        Please provide a concise evaluation formatted in Markdown:
        1. **Summary**: Brief overview of the discussion flow.
        2. **Key Points**: Bullet points of main arguments raised.
        3. **Participant Feedback**: Constructive feedback for the User specifically, and general comments on the group.
        4. **Winner/Conclusion**: Who made the most compelling point? (Optional)
      `
    });
    return response.text || "Could not generate evaluation.";
  } catch (error) {
    console.error("Error evaluating:", error);
    return "Error generating judge evaluation.";
  }
};

export const playTextToSpeech = async (text: string, voiceName: string = 'Puck') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    return new Promise((resolve) => {
      source.onended = resolve;
    });

  } catch (error) {
    console.error("Error generating speech:", error);
  }
};
