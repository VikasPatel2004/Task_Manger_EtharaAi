# Task Manager — Full Stack App

A full-stack task management application with JWT authentication and CRUD operations.

## Tech Stack

### Frontend (`/frontend`)
| Package | Purpose |
|---|---|
| React + Vite | UI Framework |
| React Router DOM | Client-side routing |
| Axios | HTTP requests |
| Context API | Global state (Auth, Tasks) |
| Tailwind CSS v4 | Styling |
| React Hot Toast | Notifications |

### Backend (`/backend`)
| Package | Purpose |
|---|---|
| Node.js + Express | Server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| dotenv | Environment variables |
| cors | Cross-origin requests |
| nodemon | Dev hot-reload |

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
# Edit .env and set your MONGO_URI and JWT_SECRET
npm run dev     # Development (nodemon)
npm start       # Production
```

### 2. Frontend Setup
```bash
cd frontend
npm run dev     # Starts at http://localhost:5173
```

> The frontend proxies `/api/*` requests to `http://localhost:5000`

---

## Environment Variables (`backend/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile (protected) |

### Tasks (all protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tasks | Get all tasks (supports ?status= & ?priority=) |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
