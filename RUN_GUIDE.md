# VuraDesk UI Startup Guide

This guide explains how to run the VuraDesk frontend locally.

## Prerequisites
- **Node.js 18 or higher**
- **npm** (comes with Node.js)

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will start on [http://localhost:5173](http://localhost:5173).

## Configuration
The frontend is configured to proxy API requests (starting with `/api`) to `http://localhost:8080`. Ensure the backend is running on port 8080.

## Recent Fixes
- Added missing `@tanstack/react-query` dependency to `package.json`.
- Freed up port `5173` if it was blocked by zombie processes.
