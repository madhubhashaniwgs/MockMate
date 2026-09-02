
const API_URL = "http://localhost:5000/api/interviews";
const AI_API_URL = "http://localhost:5000/api/ai";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "You are not authenticated. Please login again."
    );
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};


// GET ALL INTERVIEWS
export const getInterviews = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load interviews"
    );
  }

  return data.interviews || [];
};


// EVALUATE ANSWER
export const evaluateAnswer = async ({
  question,
  answer,
  jobRole,
  difficulty,
}) => {
  const response = await fetch(
    `${API_URL}/evaluate`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question,
        answer,
        jobRole,
        difficulty,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to evaluate your answer."
    );
  }

  return data;
};


// CREATE INTERVIEW
export const createInterview = async ({
  jobRole,
  difficulty,
  questionCount,
  score,
  status,
}) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      jobRole,
      difficulty,
      questionCount,
      score,
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to save interview."
    );
  }

  return data;
};


// SAVE INTERVIEW ANSWER
export const saveInterviewAnswer = async (
  interviewId,
  answerData
) => {
  const response = await fetch(
    `${API_URL}/${interviewId}/answers`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(answerData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to save an interview answer."
    );
  }

  return data;
};


// GENERATE INTERVIEW QUESTIONS

export const generateInterviewQuestions = async ({
  jobRole,
  difficulty,
  questionCount,
}) => {
  const response = await fetch(
    `${AI_API_URL}/generate-questions`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        jobRole,
        difficulty,
        questionCount,
      }),
    }
  );

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error("Response is not JSON:", responseText);

    throw new Error(
      "Server returned an invalid response. Check the API URL."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to generate interview questions"
    );
  }

  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error("Invalid questions received from AI.");
  }

  return data;
};

// GET INTERVIEW BY ID
export const getInterviewById = async (interviewId) => {
  const response = await fetch(
    `${API_URL}/${interviewId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load interview"
    );
  }

  return data.interview;
};