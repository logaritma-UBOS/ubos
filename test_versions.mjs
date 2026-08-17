import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = apiKeyMatch[1].trim();

const ai = new GoogleGenAI({ apiKey });

async function run() {
  const models = ['gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.0-flash', 'gemini-2.5-flash'];
  for (const m of models) {
    console.log(`Testing ${m}...`);
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: 'Hi'
      });
      console.log(`${m} success:`, res.text);
    } catch(e) {
      console.log(`${m} failed:`, e.message);
    }
  }
}
run();
