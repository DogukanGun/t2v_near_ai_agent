# Mythos – AI-Powered Multi-Agent Marketing Platform

[![NEAR Protocol](https://img.shields.io/badge/NEAR-Protocol-00D4AA?style=flat-square&logo=near)](https://near.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

Mythos is a next-generation AI Agent Agency designed for early-stage blockchain projects, marketers, and Web3 startups. Built on NEAR Protocol, Mythos leverages NEAR AI and NEAR Intents to deliver autonomous, on-chain AI agents that automate marketing, content creation, and engagement.

## 📋 Table of Contents

- [🚀 Overview](#-overview)
- [✨ Features](#-features)
- [🛠 Prerequisites](#-prerequisites)
- [⚡ Quick Start](#-quick-start)
- [🖥️ Backend Setup](#️-backend-setup)
- [🌐 Frontend Setup](#-frontend-setup)
- [🧠 Powered by NEAR AI](#-powered-by-near-ai)
- [⚡ NEAR Intents Integration](#-near-intents-integration)
- [🎥 Video Agent](#-video-agent)
- [🏗️ Architecture](#️-architecture)
- [📅 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📚 Resources](#-resources)

## 🚀 Overview

Mythos enables blockchain projects to outsource growth tasks to AI agents that operate on-chain, coordinate with other agents, and execute intent-driven actions without intermediaries.

## ✨ Features

- **Twitter Reply Agent** – Engages in real-time conversations, builds audience reach, and automates brand replies for Web3 startups
- **Video Agent** – Creates short-form content (TikTok, YouTube Shorts) powered by AI-generated scripts, captions, and optimization tools
- **NEAR Intents Integration** – Ensures seamless, trustless, AI-native transactions for automated task execution and payments
- **Multi-Agent System** – Scales with additional agents for marketing automation, analytics, and cross-platform campaigns

## 🛠 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **npm** or **yarn** - Package manager for Node.js
- **pip** - Python package manager (usually comes with Python)

### Optional but Recommended

- **Docker** - For containerized deployment
- **Git** - Version control system
- **VS Code** - Recommended IDE with Python and TypeScript extensions

### Environment Setup

You'll need to create environment files for both backend and frontend:

- Backend: `.env` file in the `backend/` directory
- Frontend: Environment variables (if needed) in the `app/` directory

## ⚡ Quick Start

1. Clone the repository:
```bash
git clone https://github.com/DogukanGun/t2v_near_ai_agent.git
cd t2v_near_ai_agent
```

2. Set up the backend (FastAPI):
```bash
cd backend
pip install -r requirements.txt
python main.py
```

3. Set up the frontend (Next.js) in a new terminal:
```bash
cd app
npm install
npm run dev
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🖥️ Backend Setup

The backend is built with FastAPI and provides REST API endpoints for the AI agents.

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv mythos-env

# Activate virtual environment
# On Windows:
mythos-env\Scripts\activate
# On macOS/Linux:
source mythos-env/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Environment Configuration
Create a `.env` file in the `backend/` directory:
```bash
cp .env.example .env  # If example exists
# Or create manually:
touch .env
```

Add the following environment variables to your `.env` file:
```env
# Database
MONGO_URI=mongodb://localhost:27017/mythos
CONNECTION_STRING=your_connection_string

# Authentication
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
OTP_SECRET=your_otp_secret

# Email (if using email features)
EMAIL=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Environment
OS=dev
```

### Step 5: Run the Backend Server
```bash
# Development mode
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at:
- API: http://localhost:8000
- Interactive API Documentation: http://localhost:8000/docs
- Alternative API Documentation: http://localhost:8000/redoc

### Backend Testing
Test if the backend is running correctly:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","message":"Service is up and running"}
```

## 🌐 Frontend Setup

The frontend is built with Next.js, TypeScript, and DaisyUI for a modern, responsive interface.

### Step 1: Navigate to Frontend Directory
```bash
cd app
```

### Step 2: Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Environment Configuration (if needed)
Create environment files if your application requires them:
```bash
# For local development
touch .env.local

# Add any required environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local
```

### Step 4: Run the Development Server
```bash
# Using npm
npm run dev

# Or using yarn
yarn dev

# Or using pnpm
pnpm dev

# Or using bun
bun dev
```

### Step 5: Build for Production (Optional)
```bash
# Build the application
npm run build

# Start production server
npm run start
```

The frontend will be available at:
- Development: http://localhost:3000
- Production: http://localhost:3000 (after build and start)

### Frontend Development

- Main application page: `app/page.tsx`
- Layout configuration: `app/layout.tsx`
- Components: `app/components/`
- Documentation page: `app/docs/page.tsx`

The page auto-updates as you edit files thanks to Next.js hot reload.

### Customization

The project uses:
- **Tailwind CSS** for styling
- **DaisyUI** for component library
- **TypeScript** for type safety
- **Geist Font** for typography (automatically optimized)

You can customize the theme in `tailwind.config.js` and modify DaisyUI themes as needed.

## 🧠 Powered by NEAR AI

Mythos uses NEAR AI to deploy autonomous AI agents that:

- **Orchestrate tasks** across social media platforms
- **Analyze engagement data** on-chain for verifiable insights
- **Coordinate with other agents** (e.g., Reply Agent ↔ Video Agent) for optimized content workflows
- **Self-execute actions** via NEAR Intents with no centralized approvals

## ⚡ NEAR Intents Integration

NEAR Intents is the AI-native transaction layer that allows Mythos agents to:

- **Trigger blockchain actions** (tweets, content posting, payments) on behalf of users
- **Handle microtransactions** for per-task execution costs
- **Ensure trustless, automated execution** of marketing campaigns
- **Provide transparent, auditable**, and on-chain agent activity logs

## 🎥 Video Agent

The Video Agent is designed for high-performance content production:

- **Generates scripts, captions, and titles** from trending topics
- **Produces short-form videos** for TikTok and YouTube Shorts
- **Works alongside the Twitter Agent** to repurpose viral threads into videos
- **Uses NEAR AI** for orchestration and NEAR Intents for on-chain execution and task tracking

## 🏗️ Architecture
User Intent → On-chain request (e.g., “create 5 reply tweets about DeFi project X”).

NEAR Intents Layer → Executes AI-native transaction, triggers agent actions.

NEAR AI Agent → Processes the request, coordinates multiple AI agents.

Output → Replies, videos, analytics results returned on-chain with transparent proof-of-execution.

## 📅 Roadmap

### 2025 Development Timeline

- **Q1**: NEAR AI integration, Twitter Reply Agent MVP, Video Agent alpha release
- **Q2**: Beta release with multi-agent orchestration and first user onboarding
- **Q3**: Expanded video and social campaign automation with analytics dashboard
- **Q4**: Open Agent Marketplace for third-party AI marketing agents

## 📚 Resources

- [NEAR Intents Documentation](https://docs.near.org/concepts/protocol/intents)
- [State of NEAR Q1 2025 – Messari Report](https://messari.io/report/state-of-near-q1-2025)
- [NEAR AI Documentation](https://docs.near.org/ai)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [DaisyUI Components](https://daisyui.com/components/)

State of NEAR Q1 2025 – Messari Report

## Versioning

This project follows Semantic Versioning (SemVer). Each production release is tagged with a version number in the format `vMAJOR.MINOR.PATCH`.

- **Major version** increments indicate incompatible API changes
- **Minor version** increments indicate new functionality in a backward-compatible manner
- **Patch version** increments indicate backward-compatible bug fixes

For more details on the versioning and release process, please see [CONTRIBUTING.md](CONTRIBUTING.md#versioning).
## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/t2v_near_ai_agent.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Guidelines

- **Code Style**: Follow the existing code style and linting rules
- **Testing**: Add tests for new features and ensure existing tests pass
- **Documentation**: Update documentation for any new features or changes
- **Commit Messages**: Use clear, descriptive commit messages

### Backend Development

- Follow PEP 8 Python style guidelines
- Use type hints where appropriate
- Add docstrings for functions and classes
- Run linting: `pylint backend/`

### Frontend Development

- Follow TypeScript best practices
- Use the existing component patterns
- Ensure responsive design
- Run linting: `npm run lint` in the `app/` directory

### Submitting Changes

1. **Ensure your code passes all tests**:
   ```bash
   # Backend tests (if available)
   cd backend && python -m pytest
   
   # Frontend tests (if available)
   cd app && npm test
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear description of changes
   - Link to any related issues
   - Screenshots for UI changes

### Reporting Issues

- Use GitHub Issues to report bugs or request features
- Include detailed reproduction steps for bugs
- Provide system information (OS, Node/Python versions)

### Community Guidelines

- Be respectful and inclusive
- Help others learn and contribute
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md) (if available)

---

**Built with ❤️ for the NEAR ecosystem** | **Powered by NEAR AI & NEAR Intents**
