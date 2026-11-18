# Survey Builder

A full-stack MERN application for creating dynamic surveys with conditional logic, collecting responses, and viewing analytics.

**Live Demo:** https://survery-builder.onrender.com

## Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/ashma4444/survery_builder.git
cd survery_builder
```

### 2. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 3. Configure environment variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/survey_builder
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

### 4. Run the application

Terminal 1 (backend):

```bash
cd server
npm run dev
```

Terminal 2 (frontend):

```bash
cd client
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

### 5. First user setup

The first user to register automatically receives the **admin** role. All subsequent registrations are assigned the **user** role.

## Architecture Decisions

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + Vite | Fast development with HMR, lightweight build output |
| Routing | React Router v7 | Client-side routing for SPA navigation |
| HTTP Client | Axios | Request interceptors for JWT, consistent error handling |
| Backend | Express 5 | Minimal, well-understood Node.js framework |
| Database | MongoDB + Mongoose | Flexible document schema suits dynamic survey structures |
| Auth | JWT + bcryptjs | Stateless authentication, no session storage needed |

### Why MongoDB

Surveys have a dynamic structure — each survey defines its own set of questions with varying types and options. A document database handles this naturally by storing the entire question schema as a nested array inside the survey document. This avoids complex relational joins across questions, options, and conditional logic tables.

### Data Model

```
User        → { name, email, password, role }
Survey      → { title, description, questions[], isPublished, createdBy }
  Question  → { id, type, question, required, options[], conditionalLogic }
Response    → { survey (ref), answers[{ questionId, value }] }
```

- **Questions are embedded** inside the Survey document rather than stored separately. This keeps reads fast (one query returns the full survey) and matches how surveys are created and consumed.
- **Responses are stored separately** from surveys. This allows unbounded response collection without bloating the survey document.
- **Mixed-type answers** (`Schema.Types.Mixed`) accommodate text strings, numbers (ratings), and arrays (checkboxes) in a single field.

### Authentication Flow

```
Register/Login → Server validates → Returns JWT
     ↓
React stores token in localStorage
     ↓
Axios interceptor attaches Bearer token to every request
     ↓
Server middleware verifies token → Attaches user to request
     ↓
adminOnly middleware checks role for protected routes
```

The first registered user is assigned the admin role via `User.countDocuments() === 0` check during registration.

### Conditional Logic

Questions can be conditionally shown based on a previous question's answer. The logic is stored per-question:

```json
{
  "conditionalLogic": {
    "enabled": true,
    "questionId": "q_abc1234",
    "operator": "equals",
    "value": "Yes"
  }
}
```

Evaluation happens client-side in the public survey form. If the referenced question's answer does not match, the dependent question is hidden and skipped during submission.

### Production Deployment

In production, Express serves the React build as static files from `client/dist`. This simplifies deployment to a single service — no separate frontend hosting needed. The Vite dev server proxy handles the same routing during local development.

## Assumptions and Trade-offs

### Assumptions

- **Single admin model**: The first registered user becomes admin. For an MVP this is sufficient; a production system would need an admin seed script or invitation flow.
- **Anonymous responses**: Survey responses do not require authentication. Public surveys are accessible to anyone with the link.
- **Client-side conditional logic**: Conditional display is evaluated in the browser. Server-side validation ensures required fields are present but does not re-evaluate conditional visibility.
- **Single operator**: Conditional logic supports only the `equals` operator. This covers the most common use case (show question B if question A equals "Yes").

### Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Embedded questions in Survey document | Fast reads, simple queries | 16MB document size limit (not a concern for typical surveys) |
| JWT in localStorage | Simple implementation, persists across tabs | Vulnerable to XSS (mitigated by not using `dangerouslySetInnerHTML`) |
| No pagination on responses | Simpler analytics calculation | Could be slow with thousands of responses per survey |
| `Mixed` type for answer values | Handles all question types uniformly | No schema validation on answer shape at the database level |
| No rate limiting | Simpler server setup | Public survey endpoints could be abused in production |
| No survey versioning | Simpler data model | Editing a published survey affects existing response analytics |

### What was not implemented

- Survey versioning (editing after publish)
- Partial response saving
- Rate limiting and spam protection
- Email verification
- Password reset flow
- Role management UI

These were excluded to keep scope manageable for the MVP.

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Protected | Get current user profile |

### Surveys

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/surveys` | Admin | Create a survey |
| GET | `/api/surveys` | Admin | List admin's surveys |
| GET | `/api/surveys/:id` | Admin | Get survey by ID |
| PUT | `/api/surveys/:id` | Admin | Update a survey |
| DELETE | `/api/surveys/:id` | Admin | Delete a survey |
| PATCH | `/api/surveys/:id/publish` | Admin | Toggle publish status |
| GET | `/api/surveys/public/:id` | Public | Get published survey for respondents |

### Responses

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/surveys/:id/responses` | Public | Submit a response |
| GET | `/api/surveys/:id/responses` | Admin | List responses for a survey |
| GET | `/api/surveys/:id/analytics` | Admin | Get aggregated analytics |

## Project Structure

```
survey-builder/
├── client/
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route-level page components
│       ├── services/          # API client configuration
│       └── App.jsx            # Router and layout
├── server/
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth and admin guards
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express route definitions
│   └── server.js              # Entry point
└── render.yaml                # Render deployment config
```
