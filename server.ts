import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely with the required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JalVayu GenAI safety roadmap generation endpoint
app.post("/api/jalvayu/roadmap", async (req, res) => {
  try {
    const inputContext = req.body;
    
    if (!inputContext || !inputContext.persona) {
      return res.status(400).json({ error: "Invalid input context. Persona is required." });
    }

    const systemInstruction = `You are the core GenAI orchestration engine for "JalVayu", a hyper-local monsoon preparedness assistant.
Your job is to ingest a user's situational context, live weather metrics, and infrastructural risks to generate structured, personalized safety roadmaps.

Tone guidelines:
- Direct, actionable, and comforting—not overly clinical or military-sounding.
- Personalize recommendations specifically to the user's selected persona and vulnerable assets.
- Ensure the packing_directive explicitly names and guides the protection of their specific vulnerable_assets (e.g., textbooks, notebooks, enterprise laptop, passport, checked luggage).
- Ensure the commute_strategy is highly practical and takes the transport mode, budget buffer (INR), and weather feed metrics into consideration. Suggest alternatives or mitigation strategies if the preferred mode is heavily impacted.
- Status MUST be exactly one of: "GO", "CAUTION", or "STAY_PUT".`;

    const prompt = `INPUT_CONTEXT:
${JSON.stringify(inputContext, null, 2)}

Generate the structured safety roadmap. Ensure to follow the requested tone and match the JSON schema perfectly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "Must be exactly one of: 'GO', 'CAUTION', or 'STAY_PUT'",
            },
            packing_directive: {
              type: Type.STRING,
              description: "A short, specific sentence on how to protect their specific vulnerable_assets.",
            },
            commute_strategy: {
              type: Type.STRING,
              description: "Actionable routing or transport advice based on their budget and transport mode.",
            },
            critical_alert: {
              type: Type.STRING,
              description: "A high-priority warning about waterlogging or delays on their route (if applicable).",
            }
          },
          required: ["status", "packing_directive", "commute_strategy", "critical_alert"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No safety roadmap response received from the GenAI orchestration engine.");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error in GenAI orchestration engine:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// JalVayu GenAI voice commute parsing endpoint
app.post("/api/jalvayu/parse-voice-commute", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    const systemInstruction = `You are a voice transcript parsing engine for JalVayu, the hyper-local monsoon preparedness assistant.
Your task is to analyze a spoken transit request (transcript) and extract structured entities.
Map the extracted details into the following schema:
- transportMode must be mapped to one of these exact values: "Metro", "Cab", "Auto", "Two-wheeler", "Walking". If not specified or unrecognized, default to a sensible mapping or null.
- vulnerableAssets is an array of strings representing items the user wants to protect from waterlogging/rain (e.g., laptop, textbooks, documents, medicine, passport).
- startLocation is the starting place.
- destination is where they want to go.
- persona is who they are (e.g. Gig Worker, Student, Office Goer, Delivery Partner, Tech Professional).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Extract commuting details from this voice transcript: "${transcript}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            startLocation: { type: Type.STRING, description: "Starting point or start location. Return empty string if not mentioned." },
            destination: { type: Type.STRING, description: "Destination location. Return empty string if not mentioned." },
            transportMode: { type: Type.STRING, description: "Must be exactly one of: 'Metro', 'Cab', 'Auto', 'Two-wheeler', 'Walking', or null if not mentioned." },
            persona: { type: Type.STRING, description: "Persona of the user or null if not stated." },
            vulnerableAssets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of critical assets mentioned that need protection."
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from voice parsing engine.");
    }
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in voice parsing engine:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Vite middleware integration for full-stack SPA experience
async function setupVite() {
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
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JalVayu Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to setup Vite middleware:", err);
});
