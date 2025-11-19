# AI Chat – Angular 19

This project is an implementation of an AI Chat interface. It focuses on clean architecture, maintainable code, and a seamless user experience.

## Tech Stack

- Angular 19 (standalone components)
- Angular Material (UI components)
- TailwindCSS (layout, spacing)
- Local component state (RxJS, Observables & BehaviorSubjects)
- LocalStorage (saving and restoring chats)
- Mock AI Responses (no paid APIs, fully simulated)
- Karma/Jasmine (unit tests)

## Setup Instructions

To run this project on your local machine:

1) Install Dependencies: Ensure you have Node.js (v16 or later) and Angular CLI installed. Then run npm install in the project directory to install all required packages (Angular, Material, Tailwind, etc.).

2) Serve the Application: Run ng serve. This will compile the Angular project and start a development server (usually at http://localhost:4200/).

3) Open the Dashboard: Navigate to http://localhost:4200 in your browser. You should see the AI Chat dashboard which you can interact with.

4) Run Tests: If you want to run the unit tests, use ng test. This will launch Karma and execute all spec files, ensuring everything passes.

## Features

### Core Chat Features

- Create new chats
- Send user messages
- Mock AI assistant replies
- Display message history
- Expandable "Sources" section for AI messages
- Error handling (backend simulation)
- Loading states for assistant responses

### Chat Management

- Sidebar listing of materialised chats
- Searchable chat list
- Auto-Save toggle
- Save chat manually (when Auto-Save off)
- Delete chat via row menu
- Refresh retains the currently selected chat

### Persistence

- Chats persisted to localStorage only when materialised
- Auto-Save setting persisted
- Current chat selection persisted
- Non-materialised chats are kept in memory only

## Architecture Decisions

- Standalone Components — used throughout to follow Angular’s modern pattern
- Feature-based folder structure — organized by domain (chat, layout)
- Type-safe models — Chat, ChatMessage, ChatSource interfaces for consistent data handling
- Reactive pattern — BehaviorSubjects and Observables with async loading and error states

## Future Improvements

- Persistent Storage: Currently chats are persisted in localStorage for demo purposes. In a real app, we would persist them on a backend.
- API Integration: In the future, we could replace the mock data with real API calls.
- Responsiveness: Mobile responsiveness can be added.
- Additional Feature: Features such as AI-Briefing, Template library, Guidelines can be added. 
- E2E Testing: In addition to unit tests, incorporating end-to-end tests using tools like Protractor or Cypress would ensure the user journey is flawless.