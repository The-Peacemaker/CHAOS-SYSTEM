// Quick test script
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log("API Key:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "NOT FOUND");
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
        
        const prompt = `You are Princi Kuttan, an extremely strict Indian college principal. 
        Roast a student who said: "I want to skip class tomorrow"
        Respond in ALL CAPS. Max 25 words.`;
        
        console.log("Sending request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log("\n=== GEMINI RESPONSE ===");
        console.log(text);
        console.log("=======================\n");

        // List models
        /*
       const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
       const data = await response.json();
       console.log("Available Models:", JSON.stringify(data, null, 2));
       */
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

test();
