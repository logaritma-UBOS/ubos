import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envFile.match(/GEMINI_API_KEY=(.+)/);
if (!apiKeyMatch) {
  console.error("No API key found in .env.local");
  process.exit(1);
}
const apiKey = apiKeyMatch[1].trim();

const ai = new GoogleGenAI({ apiKey });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Hi'
    });
    console.log('gemini-2.0-flash SUCCESS:', res.text);
  } catch (e) {
    console.error('gemini-2.0-flash failed:', e.message);
  }
}
run();
