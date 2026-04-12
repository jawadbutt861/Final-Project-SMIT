# LocalGig — SMIT Hackathon Project

A local services marketplace (Micro Fiverr) built with MERN stack.

## Setup

### Prerequisites
- Node.js installed
- MongoDB running locally (or use MongoDB Atlas)

### Backend
```bash
cd backend
npm install
npm run dev
```
Runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

## Demo Flow
1. Register as Customer → Post a Job
2. Register as Provider → Browse Jobs → Apply
3. Customer → Job Detail → Hire Provider
4. Chat between Customer & Provider
5. Customer → Mark Complete → Leave Review

## Tech Stack
- Frontend: React + Vite + React Router
- Backend: Node.js + Express + Socket.io
- Database: MongoDB + Mongoose
- Auth: JWT
