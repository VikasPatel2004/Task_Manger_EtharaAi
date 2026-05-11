# 🚀 EtharaAI — Team Task Management Platform

EtharaAI is a professional, full-stack team task management platform designed for modern workflows. It features a robust project-based architecture, real-time updates, and Role-Based Access Control (RBAC).

![EtharaAI Logo](./frontend/src/assets/etharalogo.png)

---

## ✨ Key Features

- **Project-Based Workspaces:** Organize tasks within dedicated projects.
- **Role-Based Access Control (RBAC):** 
  - **Admin:** Full control over projects, members, and settings.
  - **Member:** Create, edit, and view tasks within assigned projects.
- **Interactive Dashboard:** Personal task tracking across all projects.
- **Real-time Notifications:** Smooth user experience with React Hot Toast.
- **Secure Authentication:** JWT-based login with bcrypt password hashing.
- **Premium UI:** Modern, dark-themed interface built with Tailwind CSS v4.

---

## 🛠️ Tech Stack

### Frontend
- **React + Vite:** Lightning-fast UI development.
- **Context API:** Global state management for Auth, Projects, and Tasks.
- **Tailwind CSS v4:** Modern, utility-first styling.
- **Axios:** Streamlined API communication with relative path proxying.

### Backend
- **Node.js + Express:** Scalable server architecture.
- **MongoDB + Mongoose:** Reliable NoSQL database with strict schema validation.
- **JWT (JSON Web Tokens):** Secure, stateless authentication.
- **Express 5:** Using the latest features of the Express framework.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas account or local MongoDB instance

### 2. Clone the Repository
```bash
git clone <your-repo-url>
cd Task_Manager
```

### 3. Install Dependencies
You can install everything from the root folder:
```bash
npm install
```

### 4. Environment Setup
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 5. Run the Application
Start both backend and frontend (separate terminals):

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## ☁️ Deployment (Railway)

This project is optimized for a **Monolith Deployment** (Backend serves Frontend).

1. **Connect to Railway:** Link your GitHub repository.
2. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your Atlas connection string
   - `JWT_SECRET`: Your secret key
   - `CLIENT_URL`: Your Railway generated URL
3. **Build Command:** `npm run build`
4. **Start Command:** `npm start`

---

## 🔗 API Documentation (RBAC Protected)

### Projects
- `GET /api/projects` - Get all your projects
- `POST /api/projects` - Create a new project (**Admin**)
- `DELETE /api/projects/:projectId` - Delete project (**Admin**)

### Tasks
- `GET /api/projects/:projectId/tasks` - View project tasks
- `POST /api/projects/:projectId/tasks` - Add task to project
- `GET /api/tasks/mine` - View all tasks assigned to you

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ by **EtharaAI Team**
