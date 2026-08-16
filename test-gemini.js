
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: '' });
async function run() {
    try {
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: 'test'
        });
        console.log(aiResponse.text);
    } catch(e) {
        console.error(e.message);
    }
}
run();

