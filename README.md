# PMP Project — Frontend
This repository contains the frontend of the PMP (Project Management Platform), built with Next.js and React.

The frontend provides the user interface for authentication, organizations, projects, tasks, team management, dashboard, profile, and the AI Assistant. It communicates with the FastAPI backend through REST APIs.

## Features
* User registration and login
* JWT authentication
* Organization and tenant interface
* Dashboard
* Project management
* Task management
* Task details and updates
* Team member management
* Role-based UI permissions
* User profile
* AI Assistant interface
* Search and filtering
* Responsive UI
* Backend API integration
* Toast notifications and loading states

## Technology Stack
* Next.js
* React
* TypeScript
* Tailwind CSS
* Axios
* Redux Toolkit
* Lucide React
* Sonner


## Backend Integration
The frontend communicates with the FastAPI backend using Axios.

The backend API is used for:
* Authentication
* User information
* Organizations
* Projects
* Tasks
* Team members
* AI Assistant
* Other application operations
The API URL can be configured according to the development or production environment.

## Running Locally
Install dependencies:
npm install

Start the development server:
npm run dev

The frontend will normally be available at:
http://localhost:3000

## Running with Docker
Build and run the frontend through the project's Docker Compose setup:
docker compose up -d --build

The frontend runs on:
http://localhost:3000

## AI-Assisted Development
AI tools were used during development mainly for guidance, learning, debugging, and understanding new concepts.
The code was not simply copied from AI. The implementation was understood, modified, tested, and integrated during development.

## Related Repository
The backend source code is maintained separately in:
backend-PMP-project

A combined repository containing the frontend and backend is also available as:
PMP-project

## Author
**Muhammad Junaid**
BS Software Engineering
Full-Stack / MERN Developer
