# TaskFlow

A full-stack mobile To-Do application built with React Native CLI, TypeScript, Node.js, Express, MongoDB, and JWT authentication.

## Features

### Authentication
- User registration with email and password
- Secure password hashing with bcrypt
- JWT-based authentication
- Persistent login session
- Protected task APIs

### Task Management
- Create tasks
- Edit tasks
- Delete tasks
- Mark tasks as completed/incomplete
- Task title and description
- Scheduled date and time
- Deadline
- Priority: Low, Medium, High
- Categories

### Filtering & Sorting
- View all tasks
- View active tasks
- View completed tasks
- Filter high-priority tasks
- Sort by newest
- Sort by deadline
- Sort by priority

### Validation & UX
- Required task title validation
- Scheduled time cannot be in the past
- Deadline cannot be in the past
- Deadline cannot be earlier than scheduled time
- Date/time picker for scheduling
- Pull-to-refresh
- Empty states
- Loading indicators
- Delete confirmation
- Error handling
- Polished authentication and task screens

## Tech Stack

### Mobile
- React Native CLI
- TypeScript
- React Navigation
- Axios
- AsyncStorage
- React Native DateTimePicker

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- CORS
- dotenv

## Project Structure

```text
taskflow/
├── mobile/
│   ├── src/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── store/
│   │   ├── theme/
│   │   ├── types/
│   │   └── utils/
│   ├── android/
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

## Backend Setup

Open PowerShell:

```powershell
cd C:\taskflow\backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=your_secret_here
```

Make sure MongoDB is running locally.

Start the backend in development mode:

```powershell
npm run dev
```

For a production-style build:

```powershell
npm run build
npm start
```

The API runs on:

```text
http://localhost:5000
```

Health check:

```text
GET /health
```

Expected response:

```json
{
  "success": true,
  "message": "TaskFlow API is running"
}
```

## Mobile Setup

Open a second PowerShell window:

```powershell
cd C:\taskflow\mobile
npm install
```

Start Metro:

```powershell
npm start
```

For Android development, configure the Android SDK, emulator/device, and a supported Java version required by the React Native environment.

The mobile API client currently uses:

```text
http://10.0.2.2:5000/api
```

`10.0.2.2` is used to access the host machine's localhost from an Android emulator.

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Tasks

```text
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/complete
DELETE /api/tasks/:id
```

Task routes are protected with JWT authentication.

Authentication header:

```text
Authorization: Bearer <token>
```

## Task Data

A task supports:

```text
title
description
scheduledAt
deadline
priority
category
completed
```

## Development Checks

Backend TypeScript build:

```powershell
cd C:\taskflow\backend
npm run build
```

Mobile TypeScript check:

```powershell
cd C:\taskflow\mobile
npx tsc --noEmit
```

Backend health check:

```powershell
curl http://localhost:5000/health
```

## Current Verification

The following checks have been completed successfully during development:

- Backend TypeScript build
- Backend server startup
- MongoDB connection
- Backend health endpoint
- Mobile TypeScript compilation
- Authentication API testing
- Task CRUD API testing
- Task completion toggle
- Mobile task filtering and sorting implementation
- Mobile task editing
- Date/time picker integration
- Task date/deadline validation
- Git repository synchronization

## Notes

Android runtime testing is dependent on a correctly configured Android SDK/emulator or physical Android device. The project code and TypeScript checks have been validated, while local Android environment setup remained a separate machine-configuration issue during development.

## Repository

GitHub:

https://github.com/sejalP07/TaskFlow

## Assignment Coverage

TaskFlow implements the requested React Native CLI Android To-Do application with authentication, task management, backend API integration, MongoDB persistence, state handling, and additional features such as due dates, categories, filtering, and sorting.