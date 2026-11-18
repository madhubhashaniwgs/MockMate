const API_URL = `${import.meta.env.VITE_API_URL}/api/cv`;

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

// Helper to read a JSON response safely (mirrors generateInterviewQuestions)
const readJsonResponse = async (response, fallbackMessage) => {
  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error("Response is not JSON:", responseText);

    throw new Error(
      "Server returned an invalid response. Check the API URL.",
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

// PARSE CV FILE (multipart upload)
export const parseCv = async (file) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "You are not authenticated. Please login again."
    );
  }

  const formData = new FormData();
  formData.append("cv", file);

  const response = await fetch(`${API_URL}/parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await readJsonResponse(
    response,
    "Failed to parse CV file."
  );

  return data;
};

// ANALYZE CV TEXT
export const analyzeCv = async (cvText) => {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ cvText }),
  });

  const data = await readJsonResponse(
    response,
    "Failed to analyze CV."
  );

  return data;
};

// GENERATE CV-BASED INTERVIEW QUESTIONS
export const generateCvQuestions = async ({
  profile,
  jobRole,
  difficulty,
  questionCount,
}) => {
  const body = {
    profile,
    questionCount,
  };

  if (typeof jobRole === "string" && jobRole.trim()) {
    body.jobRole = jobRole.trim();
  }

  if (typeof difficulty === "string" && difficulty.trim()) {
    body.difficulty = difficulty.trim();
  }

  const response = await fetch(
    `${API_URL}/generate-questions`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }
  );

  const data = await readJsonResponse(
    response,
    "Failed to generate interview questions."
  );

  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error("Invalid questions received from AI.");
  }

  return data;
};
