const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  static async classifyComplaint(description) {
    const text = description.toLowerCase();
    
    // 1. Keyword-based Pre-classification (Fallback System)
    const mapping = {
      Police: ['police', 'crime', 'theft', 'robbery', 'fight', 'security', 'suspicious', 'harassment', 'violence', 'weapon', 'stolen', 'assault', 'murder', 'suspect', 'attack'],
      Medical: ['medical', 'hospital', 'accident', 'injury', 'ambulance', 'health', 'patient', 'bleeding', 'unconscious', 'emergency', 'doctor', 'sick', 'heart', 'broken bone'],
      Fire: ['fire', 'smoke', 'burn', 'explosion', 'firefighter', 'blaze', 'short circuit', 'burning', 'blast', 'flame'],
      Municipal: ['road', 'damage', 'leak', 'water', 'street', 'light', 'garbage', 'pothole', 'drainage', 'infrastructure', 'sanitation', 'utility', 'leakage', 'broken', 'sewage', 'streetlight', 'bin', 'trash', 'pipe']
    };

    // Priority check for very specific emergencies
    if (text.includes('fire') || text.includes('smoke')) return 'Fire';
    if (text.includes('accident') || text.includes('hospital') || text.includes('doctor')) return 'Medical';
    if (text.includes('police') || text.includes('crime') || text.includes('thief')) return 'Police';

    // General keyword check
    for (const [dept, keywords] of Object.entries(mapping)) {
      if (keywords.some(kw => text.includes(kw))) {
        return dept;
      }
    }

    // 2. AI-based Classification (Attempt if API Key exists)
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.includes('your_') || apiKey === 'your_gemini_api_key') {
        // Silently skip if no real key is provided (keyword-based fallback already happened)
        return 'Municipal';
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Classify the following complaint description into one of these departments: Police, Medical, Fire, Municipal.
        Description: "${description}"
        Return ONLY the department name.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text().trim();

      const departments = ['Police', 'Medical', 'Fire', 'Municipal'];
      return departments.find(d => aiResponse.includes(d)) || 'Municipal';
    } catch (error) {
      if (error.message.includes('API key not valid')) {
        console.warn("Gemini API key is invalid. Using keyword-based classification instead.");
      } else {
        console.error("AI Classification Error:", error.message);
      }
      return 'Municipal';
    }
  }
}

module.exports = AIService;
