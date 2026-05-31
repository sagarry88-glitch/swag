import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parser with increased limit to support image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize GoogleGenAI client lazily or with a fallback check
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI features will fail until a key is added.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// 24/7 AI Doubt Solving API
app.post("/api/doubt-solve", async (req, res): Promise<any> => {
  try {
    const { text, image, subject } = req.body;
    
    if (!text && !image) {
      return res.status(400).json({ error: "Please provide a query or upload an image of your problem." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ 
        error: "Gemini API key is missing. Please configure GEMINI_API_KEY in the Secrets panel." 
      });
    }

    const systemPrompt = `You are "DoubtSolver 24/7", an elite, encouraging, and highly technical AI Tutor specializing in ${subject || "general curriculum"}.
Your mission is to help students understand their homework questions and exam preparation items completely.

Apply these formatting guidelines rigorously:
1. Provide a step-by-step clean explanation.
2. If it is a math, science, or programming question, identify formulas, code structures, or rules clearly. Write equations in plain, readable math notation or Markdown.
3. Offer a "Pro-Tip for Exams" section advising how to write the solution to get full marks.
4. Add a quick "Similar Practice Problem" (with its short solution) for self-assessment.
5. Speak in an encouraging, expert, and academic tone. Be precise and complete.`;

    let contents: any[] = [];

    if (image && image.data && image.mimeType) {
      contents.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data // base64 string
        }
      });
    }

    // Always append the text query/context
    contents.push({
      text: text || "Please solve and explain the question shown in the attached image step-by-step."
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      solution: response.text || "No solution returned from the assistant. Please try rephrasing your question.",
    });

  } catch (error: any) {
    console.error("Error in AI Doubt Solver:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred while generating your solution. Please try again." 
    });
  }
});

// Personalized Study Guide Generator API
app.post("/api/generate-study-guide", async (req, res): Promise<any> => {
  try {
    const { subject, curriculum, level, goals } = req.body;
    
    if (!subject) {
      return res.status(400).json({ error: "Subject is required to build a study guide." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ 
        error: "Gemini API key is missing. Please configure GEMINI_API_KEY in the Secrets panel." 
      });
    }

    const prompt = `Generate a comprehensive, highly personalized Exam Study Guide for the subject: ${subject}.
Academic Level: ${level || "general"}
Current Curriculum Details: ${curriculum || "standard exam criteria"}
Student's Target Goals / Weak Fields: ${goals || "Full comprehension of topics"}

Create the study guide using structured markdown with these sections:
# 📘 Personalized ${subject} Study Guide
*Custom study blueprint designed for ${level || "undergraduate"} level.*

## 🎯 Exam Strategy & Goals
List key concepts to master, expected difficulty weightage, and time allocation recommendations.

## 🗓️ 7-Day Structured Review Plan
Create a high-impact daily checklist of specific modules to cover, from Day 1 through Day 7.

## 📝 Core Concepts & Formulas Summary
Summarize the top 4 critical theories, principles, structures, or equations that are high-probability exam triggers. Provide brief explanations.

## ⚡ High-Yield Practice Questions
Include 3 high-yield preview questions with model answers and tips on where students make common mistakes.

## 💡 Quick Recall Flashcards
Provide 5 text-based Q&A flashcards for active recall revision. Format them strictly like:
**Q1: [Question]?**
**A1:** [Answer]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.75,
      }
    });

    res.json({
      success: true,
      studyGuide: response.text || "Failed to generate study guide.",
    });

  } catch (error: any) {
    console.error("Error in Study Guide Generator:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred while building the study guide." 
    });
  }
});

// AI Performance & Diagnostic Review API
app.post("/api/progress-diagnostics", async (req, res): Promise<any> => {
  try {
    const { subject, practiceAttempts, weakTopics, avgScore } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ 
        error: "Gemini API key is missing. Please configure GEMINI_API_KEY in the Secrets panel." 
      });
    }

    const prompt = `Analyze this student's exam preparation performance data for ${subject || "Computer Science subjects"}:
- Subject of study: ${subject}
- Practice mock questions attempted: ${practiceAttempts || 0}
- Current Assessment Average: ${avgScore || 0}%
- Student-reported difficulty topics: ${weakTopics ? weakTopics.join(", ") : "general topics"}

Provide a detailed diagnostic review in structured markdown:
### 📊 AI Personal Diagnostics Report
- **Strengths**: Analyze what areas they are likely doing well in based on accomplishments.
- **Critical Gaps**: Pinpoint the precise sub-conceptual weaknesses associated with: ${weakTopics ? weakTopics.join(", ") : "the subject terms"}.
- **Targeted Action Plan**: Give 3 highly practical tips to improve their performance before the next practice score.
- **Curated Revision Tip**: Provide a specialized memory technique (like Feynman, Active Recall, or Spaced Repetition) tailored to ${subject}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      diagnostics: response.text || "Failed to generate diagnostics overview.",
    });

  } catch (error: any) {
    console.error("Error in AI Diagnostics Review:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred while generating diagnostics progress analysis." 
    });
  }
});

// Setup Vite & Static Files routing
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite hmr middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static asset build serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Catch-all route to serve index.html for SPA router
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Exam Prep Server] Running on http://localhost:${PORT}`);
  });
}

initServer().catch((error) => {
  console.error("Failed to start the Express full-stack server:", error);
});
