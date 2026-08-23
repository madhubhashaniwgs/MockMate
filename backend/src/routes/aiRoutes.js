const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================
// GENERATE INTERVIEW QUESTIONS
// ======================================

router.post("/generate-questions", authMiddleware, async (req, res) => {
  try {
    const {
      jobRole = "Frontend Developer",
      difficulty = "Medium",
      questionCount = 5,
    } = req.body;

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

    // Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);

      return res.status(500).json({
        message: "Failed to generate questions",
        error: data,
      });
    }

    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(500).json({
        message: "No questions were generated",
      });
    }

    // Remove markdown code fences if Gemini adds them
    const cleanText = generatedText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleanText);

    if (
      !parsedData.questions ||
      !Array.isArray(parsedData.questions)
    ) {
      return res.status(500).json({
        message: "Invalid question format received from AI",
      });
    }

    res.json({
      message: "Questions generated successfully",
      questions: parsedData.questions,
    });

  } catch (error) {
    console.error(
      "Generate questions error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to generate interview questions",
      error: error.message,
    });
  }
});


module.exports = router;