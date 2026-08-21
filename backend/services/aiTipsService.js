const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateRoleTips = async ({ role }) => {
  try {
    const prompt = `
You are CricketIQ, a cricket coaching assistant.

Generate 5 practical, beginner-friendly tips for a cricket player
whose role is: ${role}

RULES:

1. Write in plain, simple English suitable for a young or new
player reading this on a phone. Avoid jargon. Explain any
cricket term in plain words the first time you use it.

2. Tips must be general and safe for any skill level — do not
assume advanced technique or specific match situations.

3. Do not invent statistics, player names, or match data.

4. Focus specifically on skills relevant to a ${role}.

5. Keep each tip short — one clear idea per tip.

Return ONLY valid JSON. No Markdown. No code fences. No text
outside the JSON.

Use exactly this structure:

{
  "tips": [
    { "title": "Short tip title", "description": "One or two sentence explanation." },
    { "title": "Short tip title", "description": "One or two sentence explanation." },
    { "title": "Short tip title", "description": "One or two sentence explanation." },
    { "title": "Short tip title", "description": "One or two sentence explanation." },
    { "title": "Short tip title", "description": "One or two sentence explanation." }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Empty response received from Gemini");
    }

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini AI Tips Service Error:", error.response?.data || error.message);
    throw new Error("Unable to generate tips");
  }
};

module.exports = {
  generateRoleTips,
};