import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit for base64 image uploads
app.use(express.json({ limit: '10mb' }));

// Shared Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API routes
app.post("/api/explain", async (req, res) => {
  try {
    const { image, mimeType, prompt, language = "English", mode = "explain" } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: "Missing image data or mimeType" });
    }

    let dynamicSystemInstruction = "";

    if (mode === "scam") {
      dynamicSystemInstruction = `You are "AI Safe or Scam?" - a cybersecurity expert for everyday users.
Analyze the image/screenshot for scams, phishing, or fraud.

Language: ${language} (Use NATIVE SCRIPT for Telugu/Hindi).

Output MUST be a JSON object with this structure:
{
  "verdict": "✅ LEGITIMATE" | "⚠️ SUSPICIOUS" | "🚫 SPAM / SCAM",
  "scamProbability": number (0-100),
  "whatThisIs": "Brief description",
  "whyVerdict": "Explanation in simple terms",
  "redFlags": ["flag 1", "flag 2"],
  "whatToDo": ["action 1", "action 2"],
  "simpleExplanation": "Plain language explaining the scam technique used",
  "summary": "One sentence summary",
  "voiceResponse": "A short, urgent but calm voice summary in native script. State verdict, biggest red flag, and what NOT to do. < 5 sentences."
}

BE EXTREMELY CAREFUL. If you see OTP requests, urgency, or unknown payment links, flag as SPAM / SCAM.`;
    } else if (mode === "form") {
      dynamicSystemInstruction = `You are "Live Form Guidance AI".
Analyze the form and provide step-by-step filling instructions.

Language: ${language} (Use NATIVE SCRIPT for Telugu/Hindi).

Output MUST be a JSON object with this structure:
{
  "formName": "Name and issuing authority",
  "whoNeedsIt": "Who this is for and its purpose",
  "fields": [
    {
      "label": "Exact field label visible",
      "instruction": "Simple guidance in native script",
      "example": "A realistic example value",
      "importance": "Required" | "Optional",
      "box_2d": [ymin, xmin, ymax, xmax] (normalized 0-1000)
    }
  ],
  "requiredDocuments": ["Doc 1", "Doc 2"],
  "warnings": ["Mistake to avoid", "Mandatory field info"],
  "voiceInstructions": "Short conversational summary in native script. Mention form purpose and 3 most important fields. < 6 sentences."
}

Never skip visible fields. Give clear examples for every field.`;
    } else {
      dynamicSystemInstruction = `You are "Explain My World," a multimodal AI assistant.
Your goal is to simplify complex visual information. 
Language: ${language} (Use NATIVE SCRIPT for Telugu/Hindi).

Structure:
# What This Is
[Detailed description and purpose]

# Important Details
[Deadlines, warnings, dosage, etc.]

# Simple Explanation
[Zero jargon explanation. Use simple analogies.]

# What You Should Do Next
[Step-by-step practical guidance]

# Warnings or Risks
[Specific focus on safety, scams, or expired dates]

# Simplified Summary
[One brief sentence]

# Voice Response
[A short, natural-sounding conversational response in native script. Friendly tone, mention critical warnings.]`;
    }

    const systemInstruction = `${dynamicSystemInstruction}

IF THE LANGUAGE IS TELUGU, YOU MUST USE TELUGU SCRIPT.
IF THE LANGUAGE IS HINDI, YOU MUST USE HINDI SCRIPT.
No legal or medical diagnoses. Be beginner-friendly.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: image,
      },
    };

    const textPart = {
      text: prompt || `Analyze this image in ${mode} mode for ${language}.`,
    };

    const result: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        responseMimeType: mode === "explain" ? "text/plain" : "application/json",
      }
    });

    if (mode === "explain") {
      res.json({ explanation: result.text });
    } else {
      res.json(JSON.parse(result.text));
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Failed to analyze image", 
      details: error.message 
    });
  }
});

// For follow-up questions
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, language = "English" } = req.body; // Array of { role: 'user' | 'model', parts: [{ text }] }

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    // Convert potential 'assistant' role to 'model' for Gemini
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: m.parts || [{ text: m.text }]
    }));

    const lastMessage = messages[messages.length - 1].text;

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: history,
      config: {
        systemInstruction: `You are the 'Explain My World' assistant. Your goal is to simplify complex information. Continue the conversation in a friendly, supportive, and practical manner. ALWAYS RESPOND ENTIRELY IN ${language} using its NATIVE SCRIPT (Telugu for Telugu, Hindi for Hindi). Translate jargon and explain things as if to a beginner.`,
      },
    });
    
    const result = await chat.sendMessage({ message: lastMessage });
    res.json({ text: result.text });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
