import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: 'INVALID_KEY' });
async function run() {
  try {
    await ai.models.generateContent({ model: 'gemini-3.7-flash', contents: 'Hi' });
  } catch (e) {
    console.log("instanceof Error:", e instanceof Error);
    console.log("e.message:", e.message);
    console.log("String(e):", String(e));
    console.log("JSON.stringify(e):", JSON.stringify(e));
  }
}
run();
