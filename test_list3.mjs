import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = apiKeyMatch[1].trim();
const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const response = await ai.models.list();
    const models = response.items || response; 
    for (const model of models) {
      console.log(model.name);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
