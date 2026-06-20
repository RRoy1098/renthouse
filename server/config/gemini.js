import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-2.5-flash";

const getGeminiResponse = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

const generateChat = async ({ systemPrompt, conversationHistory, userMessage }) => {
  try {
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...(conversationHistory || []),
      { role: "user", parts: [{ text: userMessage }] },
    ];
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

const generateChatStream = async ({ systemPrompt, conversationHistory, userMessage }) => {
  try {
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...(conversationHistory || []),
      { role: "user", parts: [{ text: userMessage }] },
    ];
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents,
    });
    return stream;
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
};

const generateJSON = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const text = response.text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/{[\s\S]*?}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Gemini JSON Error:", error);
    throw error;
  }
};

export { getGeminiResponse, generateChat, generateChatStream, generateJSON };
export default getGeminiResponse;