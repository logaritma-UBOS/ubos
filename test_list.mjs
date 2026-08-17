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
    const models = await ai.models.list();
    console.log("Available models:");
    for (const model of models) {
      if (model.name.includes('flash')) {
        console.log(model.name);
      }
    }
  } catch (e) {
    console.error('List models failed:', e.message);
  }
}
run();
