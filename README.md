## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Containerization**: Docker

---

## Project Setup

### Prerequisites
- Node.js
- PostgreSQL (Running locally or via Docker)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Initialize database (Ensure PostgreSQL is running)
npm run db:init

# Seed initial data (29 sample candidates)
npm run seed
```

### Running the Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```
The server will be available at `http://localhost:3000`.

---

## API Endpoints

### 1. Health Check
`GET /health`
- **Description**: Verify the service status.
- **Example Response**:
  ```json
  { "status": "ok" }
  ```
- **Example Request**:
  ```bash
  curl http://localhost:3000/health
  ```

### 2. List Candidates
`GET /candidates`
- **Description**: Search and filter candidates with pagination.
- **Query Parameters**:
  - `q`: Full-text search (fullName, headline, skills)
  - `location`: Filter by location
  - `skill`: Filter by a single skill
  - `status`: "Open to work", "Interviewing", "Hired"
  - `availability`: "Immediate", "2 weeks", "1 month"
  - `minExp` / `maxExp`: Experience range
  - `sort`: `updatedAt`, `score`, `yearsOfExperience`
  - `order`: `ASC` or `DESC`
  - `page` / `pageSize`: Pagination control (max 50)
- **Example Request**:
  ```bash
  curl "http://localhost:3000/candidates?page=1&pageSize=10&q=react&sort=score&order=DESC"
  ```

### 3. Get Candidate by ID
`GET /candidates/:id`
- **Description**: Retrieve a full candidate profile including extended fields.
- **Example Request**:
  ```bash
  curl http://localhost:3000/candidates/c-001
  ```
- **Example Response**:
  ```json
  {
    "id": "c-001",
    "fullName": "John Doe",
    "headline": "Senior React Developer",
    "location": "San Francisco, CA",
    "yearsOfExperience": 5,
    "skills": ["React", "TypeScript", "Node.js"],
    "availability": "2 weeks",
    "updatedAt": "2026-05-03T22:10:03.541Z",
    "status": "Open to work",
    "score": 86,
    "shortlisted": false,
    "rejected": false,
    "languages": ["Arabic", "English"],
    "projects": [
      {
        "name": "Component Library",
        "tech": ["React", "TypeScript", "Storybook"],
        "description": "Built a Storybook-driven library with theming and accessibility checks."
      }
    ],
    "auditLogs": [
      {
        "at": "2026-05-03T22:10:03.541Z",
        "to": false,
        "from": true,
        "action": "shortlisted_changed"
      },
      {
        "at": "2026-05-03T22:10:03.541Z",
        "to": true,
        "from": false,
        "action": "rejected_changed"
      }
    ]
  }
  ```

### 4. Update Candidate
`PATCH /candidates/:id`
- **Description**: Update candidate status and flags. Must update at least **two** of: `status`, `shortlisted`, `rejected`.
- **Validation**: Strict body validation; unknown fields are rejected.
- **Example Request**:
  ```bash
  curl -X PATCH "http://localhost:3000/candidates/c-001" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "Interviewing",
      "shortlisted": true
    }'
  ```

### 5. Related Candidates
`GET /candidates/:id/related`
- **Description**: Returns 5-10 related candidates based on a weighted similarity score.
- **Example Request**:
  ```bash
  curl "http://localhost:3000/candidates/c-001/related?page=1&pageSize=5"
  ```
- **Scoring Logic**:
  - **Location Match**: +20 points (exact match)
  - **Skill Overlap**: Up to 50 points (proportional match)
  - **Experience Match**: +30 points (identical years of experience)
  - *Threshold*: Candidates with a total score ≤ 30 are excluded.

---

## Core Behaviors

### Filtering & Sorting
- **Stable Ordering**: Results are sorted by the requested field.
- **Case-Insensitive**: All string searches and filters are case-insensitive.

### Error Handling
Errors return a consistent JSON structure:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "pageSize must be less than or equal to 50",
    "details": []
  }
}
```

---

## Design Decisions & Trade-offs

1. **NestJS Modular Architecture**: Chose NestJS for its strong dependency injection and high maintainability.
2. **PostgreSQL JSONB**: Used `JSONB` for `auditLogs` and `projects` to provide schema flexibility while maintaining relational integrity for core fields.
3. **Strict Validation**: Implemented `class-validator` with `forbidNonWhitelisted: true` to ensure API security and data consistency.

---

## Future Improvements

1. **NoSQL Integration**: Migrate write-heavy or highly flexible fields like `auditLogs` to a NoSQL database (e.g., **MongoDB**). This would improve write speed and handle large volumes of audit data more efficiently as the platform scales.
2. **Full-Text Search Engine**: Integrate Elasticsearch for more advanced search capabilities.
3. **Advanced Similarity Matching**: Use a search engine utilizing vector embeddings and reranker models for advanced semantic search and similar candidates recommendation.

## Docker Support

Build and run the entire environment using Docker Compose:
```bash
docker compose up
```
---

## Time Spent Estimate: 5 hours

---

## Postman Collection

You can find the Postman collection for testing the API in the file:

`PandyAI.postman_collection.json`