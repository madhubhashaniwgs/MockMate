# Database Design

This document separates database structures used by the current MVP from planned structures.

## Users Table

Stores user account information.

Fields:
- id
- name
- email
- password
- profile_image_path
- created_at

To add this field to an existing database:

```sql
ALTER TABLE users ADD COLUMN profile_image_path TEXT;
```


## Interviews Table

Stores interview sessions.

Fields:
- id
- user_id
- job_role
- difficulty
- question_count
- score
- created_at
- status


## Interview Answers Table

Stores evaluated answers belonging to an interview.

Fields:
- id
- interview_id
- question
- answer
- score
- feedback
- strength
- improvement
- created_at