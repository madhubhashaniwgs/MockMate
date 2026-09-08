# API Design


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


POST /api/auth/profile/image

Purpose:
Upload or replace the authenticated user's profile picture


DELETE /api/auth/profile/image

Purpose:
Remove the authenticated user's profile picture


## Resume APIs

POST /api/resume/upload

Purpose:
Upload user resume


GET /api/resume

Purpose:
Get resume details


## Interview APIs

POST /api/interview/start

Purpose:
Start AI interview


POST /api/interview/submit

Purpose:
Submit interview answers


## Roadmap APIs

POST /api/roadmap/generate

Purpose:
Generate career roadmap