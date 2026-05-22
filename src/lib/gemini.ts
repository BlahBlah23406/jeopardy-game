/// <reference types="vite/client" />
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Category, Question } from "../types";

export async function generateGameDataFromPrompt(prompt: string, apiKey: string): Promise<{ categories: Category[], finalJeopardyQuestions: Question[] }> {
    if (!apiKey) {
        throw new Error("Missing Gemini API Key. Please provide a valid key.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are a helpful assistant that generates Jeopardy-style trivia game data.
The user will provide a topic or prompt. You must generate exactly 6 categories, each with exactly 5 questions based on the topic.
The questions MUST increase in difficulty from 100 to 500 points.
Additionally, you must generate exactly 10 Final Jeopardy questions (points: 2000).

You must return the result STRICTLY as a JSON object containing two properties: "categories" and "finalJeopardyQuestions", matching the exact TypeScript interface:

interface Question {
  id: string; // generate a unique string like 'q-1', 'q-2', etc.
  points: number; // 100, 200, 300, 400, or 500 (or 2000 for Final Jeopardy)
  text: string; // The question text
  answer: string; // The correct answer
  moreInfo?: string; // Optional fun fact or extra info
  isAnswered: boolean; // Must be false
}

interface Category {
  id: string; // generate a unique string like 'cat-1', 'cat-2', etc.
  title: string; // The category name
  questions: Question[]; // Exactly 5 questions
}

interface GameData {
  categories: Category[];
  finalJeopardyQuestions: Question[]; // Exactly 10 questions
}

Return ONLY the raw JSON object. Do not include markdown formatting blocks like \`\`\`json.`;

    try {
        const result = await model.generateContent([
            systemPrompt,
            `User Prompt: ${prompt}`
        ]);
        const response = await result.response;
        const text = response.text();

        let jsonStr = text.trim();
        if (jsonStr.startsWith('\`\`\`json')) {
            jsonStr = jsonStr.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (jsonStr.startsWith('\`\`\`')) {
            jsonStr = jsonStr.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const data = JSON.parse(jsonStr) as { categories: Category[], finalJeopardyQuestions: Question[] };

        if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
            throw new Error("Generated data is missing categories.");
        }

        return data;
    } catch (error) {
        console.error("Error generating game data:", error);
        throw error;
    }
}

export async function verifyAnswerWithAI(
    questionText: string,
    correctAnswer: string,
    userAnswer: string,
    apiKey: string
): Promise<{ isCorrect: boolean, explanation: string }> {
    if (!apiKey) {
        throw new Error("Missing Gemini API Key. Please provide a valid key.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an expert, strict but fair trivia game judge.
You will be given the original question, the officially correct answer, and a user's typed attempt to answer the question.
You must determine if the user's answer is correct enough to be awarded points. 
Trivia standards apply (e.g. minor spelling errors or missing articles like "a", "an", "the" are okay, but totally wrong names or missing key parts of a compound name are wrong).

You must return your judgment EXACTLY as a JSON object with this interface:
{
  "isCorrect": boolean, // true if they get points, false if not
  "explanation": string // a short 1-2 sentence explanation of your ruling
}

Return ONLY the raw JSON object. Do not reveal the term in the explanation, if needed refer to it as "the term". Do not include markdown formatting blocks like \`\`\`json.`;

    const userPrompt = `Question: "${questionText}"\nOfficial Answer: "${correctAnswer}"\nUser's Attempt: "${userAnswer}"`;

    try {
        const result = await model.generateContent([
            systemPrompt,
            userPrompt
        ]);
        const response = await result.response;
        const text = response.text();

        let jsonStr = text.trim();
        if (jsonStr.startsWith('\`\`\`json')) {
            jsonStr = jsonStr.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (jsonStr.startsWith('\`\`\`')) {
            jsonStr = jsonStr.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const data = JSON.parse(jsonStr) as { isCorrect: boolean, explanation: string };
        return data;
    } catch (error) {
        console.error("Error verifying answer:", error);
        throw error;
    }
}
