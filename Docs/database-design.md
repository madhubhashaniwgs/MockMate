# Database Design

## Users Table

Stores user account information.

Fields:
- id
- full_name
- email
- password
- career_goal
- created_at


## Resumes Table

Stores uploaded resume details.

Fields:
- id
- user_id
- file_name
- file_path
- extracted_text
- created_at


## Interviews Table

Stores interview sessions.

Fields:
- id
- user_id
- role
- score
- feedback
- created_at


## Career Roadmaps Table

Stores generated career plans.

Fields:
- id
- user_id
- goal
- roadmap_content
- created_at