import { HfInference } from "@huggingface/inference";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"; // ✅ import SchemaType
import type { ChatAttachment } from "../types";

// ENV KEYS
const HF_KEY = import.meta.env.VITE_HF_TOKEN;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// CLIENTS
const hf = new HfInference(HF_KEY);
const gemini = new GoogleGenerativeAI(GEMINI_KEY);

// MODELS
const MODELS = {
  chat: "gemini-2.5-flash", // Gemini chat
  textGen: "meta-llama/Llama-3-8b-Instruct",
  imageGen: "black-forest-labs/FLUX.1-schnell",
};

/* -------------------------------------------------------------
   CHAT (Gemini)
------------------------------------------------------------- */
export const generateChatResponse = async (
  message: string,
  history: { role: "user" | "model"; text: string }[] = [],
  attachments: ChatAttachment[] = []
) => {
  try {
    const chatModel = gemini.getGenerativeModel({ model: MODELS.chat });

    const formattedHistory = history.map((h) => ({
      role: h.role === "model" ? "assistant" : "user",
      parts: [{ text: h.text }],
    }));

    const userParts: any[] = [{ text: message }];

    for (const att of attachments) {
      if (att.type === "image") {
        userParts.push({
          inlineData: {
            data: att.data.split(",")[1],
            mimeType: att.mimeType || "image/jpeg",
          },
        });
      } else if (att.type === "file") {
        userParts.push({
          text: `[File: ${att.name}]\n${att.data}`,
        });
      }
    }

    const result = await chatModel.generateContent({
      contents: [...formattedHistory, { role: "user", parts: userParts }],
    });

    return result.response.text();
  } catch (err) {
    console.error("Gemini Chat Error:", err);
    throw err;
  }
};

/* -------------------------------------------------------------
   IMAGE GENERATION
------------------------------------------------------------- */
export const generateImage = async (prompt: string) => {
  try {
    const response = await hf.textToImage({
      model: MODELS.imageGen,
      inputs: prompt,
      parameters: {
        negative_prompt: "blurry, distorted, low quality",
        num_inference_steps: 4,
        guidance_scale: 0,
      },
    });

    let base64: string;

    if (typeof response === "string") {
      // If HF returns a base64 string directly
      base64 = response;
    } else {
      // If HF returns a Blob or unknown
      const blob = response as Blob;
      const buffer = await blob.arrayBuffer();
      base64 = btoa(
        new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), "")
      );
    }

    return `data:image/jpeg;base64,${base64}`;
  } catch (err) {
    console.error("HF Image Gen Error:", err);
    throw err;
  }
};

/* -------------------------------------------------------------
   SUMMARY GENERATION
------------------------------------------------------------- */
export const generateSummary = async (text: string) => {
  try {
    const model = gemini.getGenerativeModel({ model: MODELS.chat });

    const prompt = `Summarize the following text and respond using ONLY valid JSON. Do NOT include code fences.

Text:
${text}`;

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT, // ✅ use SchemaType enum
          properties: {
            summary: { type: SchemaType.STRING },
            keyPoints: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            definitions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  term: { type: SchemaType.STRING },
                  definition: { type: SchemaType.STRING },
                },
                required: ["term", "definition"],
              },
            },
          },
          required: ["summary", "keyPoints", "definitions"],
        },
        temperature: 0.2,
      },
    });

    const jsonText = await response.response.text();
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Summary Gen Error:", err);
    throw err;
  }
};

/* -------------------------------------------------------------
   FLASHCARD GENERATION
------------------------------------------------------------- */
export const generateFlashcards = async (
  topicOrPrompt: string,
  count: number = 5,
  contextText?: string
) => {
  try {
    const model = gemini.getGenerativeModel({ model: MODELS.chat });

    const basePrompt = contextText
      ? `Create ${count} flashcards based on the following text. Focus on the main concepts related to "${topicOrPrompt}".\n\nText Content: ${contextText.substring(
          0,
          20000
        )}`
      : `Create ${count} flashcards for the topic: ${topicOrPrompt}.`;

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: basePrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY, // ✅ use SchemaType enum
          items: {
            type: SchemaType.OBJECT, // ✅ use SchemaType enum
            properties: {
              front: { type: SchemaType.STRING },
              back: { type: SchemaType.STRING },
            },
            required: ["front", "back"],
          },
        },
        temperature: 0.2,
      },
    });

    const jsonText = await response.response.text();
    const parsed = JSON.parse(jsonText);

    if (!Array.isArray(parsed)) throw new Error("Response is not an array.");
    parsed.forEach((card: any) => {
      if (typeof card.front !== "string" || typeof card.back !== "string")
        throw new Error("Each card must have 'front' and 'back' as strings.");
    });

    return parsed;
  } catch (err) {
    console.error("Flashcard Gen Error:", err);
    throw err;
  }
};

/* -------------------------------------------------------------
   MCQ GENERATION
------------------------------------------------------------- */
export const generateMCQ = async (text: string, count: number = 5) => {
  try {
    const model = gemini.getGenerativeModel({ model: MODELS.chat });

    const prompt = `Create ${count} multiple-choice questions (MCQs) from the following text. Return ONLY a JSON array with 'question', 'options' (array of 4 strings), and 'answer':

Text:
${text}`;

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
              correctAnswer: {
                type: SchemaType.STRING,
                description: "Must match one of the options exactly",
              },
              explanation: { type: SchemaType.STRING },
            },
            required: ["question", "options", "correctAnswer"], // <-- FIXED HERE
          },
        },
        temperature: 0.2,
      },
    });

    const jsonText = await response.response.text();
    const parsed = JSON.parse(jsonText);

    if (!Array.isArray(parsed)) throw new Error("Response is not an array.");
    parsed.forEach((item: any) => {
      if (
        typeof item.question !== "string" ||
        !Array.isArray(item.options) ||
        typeof item.correctAnswer !== "string" // <-- FIXED HERE
      ) {
        throw new Error(
          "Each MCQ must have 'question' (string), 'options' (array), and 'correctAnswer' (string)."
        );
      }
    });

    return parsed;
  } catch (err) {
    console.error("MCQ Gen Error:", err);
    throw err;
  }
};
