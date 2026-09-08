# AI Career Development Platform

## Project Objective

The current MVP helps users prepare for technical interviews through timed, text-based mock interviews, AI-generated questions, answer evaluation, performance reports, and interview history.

Resume analysis, speaking interviews, and career roadmaps are planned extensions and are not implemented in the current version.

## Implemented Features

1. User Authentication
- User registration and login
- JWT-based authentication
- Protected user resources
- Profile management and profile image upload
- Password change and password reset flow

2. Text-Based AI Mock Interviews
- Select a job role and difficulty
- Generate technical interview questions with Gemini
- Answer questions using text
- Two-minute timer for each question
- Resume active interview state after a page refresh

3. AI Answer Evaluation
- Score each submitted answer
- Show strengths
- Show improvement areas
- Provide constructive feedback

4. Performance and History
- Overall and per-question scores
- Performance levels and score distribution
- Performance trends
- Completed interview history

## Planned Features

The following features are not implemented yet:

- Resume upload and AI resume analysis
- Resume scoring and missing-skill detection
- Speaking or voice-based interviews
- Speech-to-text answer input
- Personalized career roadmap generation
- Learning progress tracking
- Job recommendations

## Technology Stack

Frontend:
- React.js
- JavaScript
- React Router

Backend:
- Node.js
- Express.js
- REST API

Database:
- PostgreSQL

AI:
- Google Gemini API