import { GoogleGenAI } from "@google/genai";
import { Message, Participant } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  participants: Participant[],
  forcedSpeaker?: Participant
): Promise<string | null> => {
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

  const speakerInstruction = forcedSpeaker 
    ? `It is strictly ${forcedSpeaker.name}'s turn to speak. You MUST generate a response for ${forcedSpeaker.name} (ID: ${forcedSpeaker.id}).` 
    : "Generate the next contribution.";

  const systemPrompt = `
    You are simulating a group discussion. 
    Topic: "${topic}"
    
    The user (${user?.name || 'User'}) is participating.
    The AI participants are:
    ${participantDescriptions}

    Here is the discussion so far:
    ${historyText}

    Task:
    ${speakerInstruction}
    Provide a full, thoughtful, and complete response that adds value to the discussion. 
    Ensure the response is a complete sentence or paragraph. Do not cut off the sentence.
    Maintain the assigned personality.
    Do not start the response with "Name:". Just output the text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: systemPrompt,
      config: {
        maxOutputTokens: 1000, // Increased to ensure full statements
      }
    });

    return response.text?.trim() || null;
  } catch (error) {
    console.error("Error generating discussion:", error);
    return null;
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
