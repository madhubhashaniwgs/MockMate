const { GoogleGenAI } = require("@google/genai");

const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("Gemini API key is not configured");
    error.statusCode = 500;
    throw error;
  }

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const parseJsonResponse = (text, message) => {
  const cleanText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleanText);
  } catch (error) {
    const parseError = new Error(message);
    parseError.statusCode = 502;
    parseError.cause = error;
    throw parseError;
  }
};

const generateQuestions = async ({
  jobRole = "Frontend Developer",
  difficulty = "Medium",
  questionCount = 5,
}) => {
  const prompt = `
You are an expert technical interviewer.

Generate ${questionCount} technical interview questions for the following role:

Job Role: ${jobRole}
Difficulty: ${difficulty}

Requirements:
- Questions must be relevant to the selected job role.
- Questions must match the selected difficulty.
- Do not repeat questions.
- Questions should test practical technical knowledge.
- Include a mixture of conceptual and practical questions.
- Do not include answers.
- Return ONLY valid JSON.
- The JSON must contain an array called "questions".

Expected format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text"
    }
  ]
}
`;

  const response = await getAiClient().models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });
  const data = parseJsonResponse(
    response.text || "",
    "Gemini returned invalid question data"
  );

  if (!Array.isArray(data.questions)) {
    const error = new Error("Invalid question format received from AI");
    error.statusCode = 502;
    throw error;
  }

  return data.questions;
};

const evaluateAnswerWithAi = async ({
  question,
  answer,
  jobRole,
  difficulty,
}) => {
  const prompt = `
You are an expert technical interviewer.
Evaluate the candidate's answer.
Job Role: ${jobRole || "General"}
Difficulty: ${difficulty || "Medium"}
Interview Question:
${question}
Candidate Answer:
${answer}

Give a score from 0 to 100 and return ONLY valid JSON:
{
  "score": 0,
  "feedback": "Concise feedback about the answer.",
  "strength": "The strongest part of the answer.",
  "improvement": "The most important thing to improve."
}

Rules:
- score must be an integer between 0 and 100
- feedback must not exceed 250 characters
- strength must describe one clear positive aspect
- improvement must describe one actionable improvement
`;

  const response = await getAiClient().models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });
  const evaluation = parseJsonResponse(
    response.text || "",
    "Gemini returned invalid evaluation data"
  );
  const score = Number(evaluation.score);

  if (!Number.isFinite(score)) {
    const error = new Error("Gemini returned an invalid score");
    error.statusCode = 502;
    throw error;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    feedback: (evaluation.feedback || "No detailed feedback provided.").slice(0, 250),
    strength: (evaluation.strength || "No specific strength identified.").slice(0, 150),
    improvement: (evaluation.improvement || "Continue practicing and improving your answer.").slice(0, 180),
  };
};

module.exports = {
  generateQuestions,
  evaluateAnswerWithAi,
};
