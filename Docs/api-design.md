## Authentication APIs

POST /api/auth/register

Purpose:
Create a new user account


POST /api/auth/login

Purpose:
Login user


GET /api/auth/profile

Purpose:
Get the authenticated user's profile, including profile image path


POST /api/auth/forgot-password

Purpose:
Send a password reset link to a registered email address


POST /api/auth/reset-password

Purpose:
Reset a user's password using a valid, time-limited reset token


POST /api/auth/profile/image

Purpose:
Upload or replace the authenticated user's profile picture


DELETE /api/auth/profile/image

Purpose:
Remove the authenticated user's profile picture


## Interview APIs

POST /api/ai/generate-questions

Purpose:
Generate technical interview questions for a selected role and difficulty


POST /api/interviews

Purpose:
Save a completed interview


GET /api/interviews

Purpose:
Get the authenticated user's interview history


GET /api/interviews/:id

Purpose:
Get one interview and its answers


POST /api/interviews/evaluate

Purpose:
Evaluate a text answer with AI


POST /api/interviews/:id/answers

Purpose:
Save an evaluated interview answer

