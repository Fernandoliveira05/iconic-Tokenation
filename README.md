# ICONIC

<div align="center">
  <img src="./iconic_logo.jpg" alt="ICONIC Logo" width="300"/>
  <h3>Turning wishes and style into memorable moments</h3>
  <p>A revolutionary platform built on Sui blockchain for the media and entertainment industry</p>
  
  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://iconicxp.netlify.app)
  [![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/iconic_xp)
  [![Sui](https://img.shields.io/badge/Sui-6B4CD3?style=for-the-badge&logo=sui&logoColor=white)](https://sui.io/)
</div>

## 📋 Table of Contents

- [ICONIC](#iconic)
  - [📋 Table of Contents](#-table-of-contents)
  - [🌟 Overview](#-overview)
  - [💼 Business Model](#-business-model)
    - [For Content Creators:](#for-content-creators)
    - [For Users:](#for-users)
    - [Revenue Streams:](#revenue-streams)
  - [✨ Features](#-features)
  - [🛠️ Technology Stack](#️-technology-stack)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
      - [Clone the repository](#clone-the-repository)
      - [Frontend Setup](#frontend-setup)
      - [Backend Setup](#backend-setup)
    - [Environment Configuration](#environment-configuration)
      - [Frontend (.env)](#frontend-env)
      - [Backend (.env)](#backend-env)
  - [📁 Project Structure](#-project-structure)
  - [🗺️ Roadmap](#️-roadmap)
  - [👥 Team](#-team)
  - [🔗 Links](#-links)

## 🌟 Overview

ICONIC is a revolutionary platform that is redefining the media and entertainment experience through Sui blockchain technology. Our platform transforms personal desires into memorable experiences by connecting event creators directly with users through transparent, secure interactions.

We're participating in the **Sui Overflow 2025** hackathon in the **Media and Entertainment** track, with the goal of securing incubation to expand our impact in the global market.

## 💼 Business Model

ICONIC operates on a multi-sided platform business model that creates value for both content creators and users:

### For Event Creators:
- **Direct Monetization**: Eliminate intermediaries and receive 90% of revenue
- **Authentic Connection**: Build genuine relationships with fans and followers
- **Creative Tools**: Access to tools for creating personalized experiences
- **IP Protection**: Blockchain-based verification of intellectual property

### For Users:
- **Personalized Experiences**: Access to exclusive content tailored to individual preferences
- **Data Control**: Full ownership and control over personal data
- **Community Participation**: Active role in shaping the platform's future
- **Reward System**: Incentives for engagement and contributions

### Revenue Streams:
1. **Transaction Fees**: Small percentage from creator-user transactions
2. **Premium Subscriptions**: Enhanced features for power users
3. **Creator Verification**: Paid verification for established creators
4. **Promotional Opportunities**: Featured placement for content

Our model is designed to be sustainable while prioritizing value creation for all participants in the ecosystem.

## ✨ Features

- **Recommendation Engine**: Token-based and preference-driven content recommendations
- **Secure Blockchain Transactions**: Transparent and immutable record-keeping
- **Creator Dashboard**: Analytics and audience insights
- **User Preference Center**: Detailed control over content discovery
- **Smart Contract Integration**: Automated royalty distribution
- **Mobile-First Design**: Optimized for on-the-go experiences

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Firebase Authentication
- **Backend**: Node.js, NestJs
- **Database**: PostgreSQL (via Supabase), Redis
- **Authentication**: Firebase Authentication, JWT
- **Storage**: Firebase Storage, Supabase Storage
- **Blockchain**: Sui Network (testnet)
- **Smart Contracts**: Move language
- **Deployment**: Vercel (frontend), AWS (backend)/Render

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- Sui CLI (for blockchain interaction)

### Installation

#### Clone the repository

```bash
git clone https://github.com/iconic-team-ofc/iconic.git
cd iconic
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

#### Backend Setup

```bash
cd backend
npm install
npm run dev:start
```

The backend API will be available at `http://localhost:8000`

### Environment Configuration

> ⚠️ **IMPORTANT**: The project requires `.env` files with specific credentials to function properly. For security reasons, these credentials are not included in the repository.

#### Frontend (.env)

Create an `.env` file in the `frontend` folder with the following variables:

```
VITE_API_BASE=http://localhost:3000
VITE_FIREBASE_API_KEY=<request from team>
VITE_FIREBASE_AUTH_DOMAIN=<request from team>
VITE_FIREBASE_PROJECT_ID=<request from team>
VITE_FIREBASE_STORAGE_BUCKET=<request from team>
VITE_FIREBASE_MESSAGING_SENDER_ID=<request from team>
VITE_FIREBASE_APP_ID=<request from team>
VITE_FIREBASE_MEASUREMENT_ID=<request from team>
VITE_PAYWALL_ADDRESS=<request from team>
VITE_API_URL=http://localhost:3000
```

#### Backend (.env)

Create an `.env` file in the `backend` folder with the following variables:

```
SUPABASE_URL=<request from team>
SUPABASE_SERVICE_ROLE_KEY=<request from team>
JWT_SECRET=<request from team>
JWT_EXPIRATION=20m
FIREBASE_PROJECT_ID=<request from team>
FIREBASE_CREDENTIALS_PATH=src/config/firebase-service-account.json
DATABASE_URL=<request from team>
REDIS_HOST=<request from team>
REDIS_PORT=<request from team>
REDIS_PASSWORD=<request from team>
FIREBASE_SERVICE_ACCOUNT_BASE64=<request from team>
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
```

> 📝 **Note**: To obtain the necessary credentials, please contact the ICONIC team. Without these configurations, the project will not work locally.

## 📁 Project Structure

```
iconic/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── contracts/         # Sui Move smart contracts
├── docs/              # Documentation and business model
└── README.md          # Project documentation
```

## 🗺️ Roadmap

- **Q3 2025**: Launch of creator onboarding program and initial user testing
- **Q4 2025**: Public beta release with core functionality
- **Q1 2026**: Full platform launch with enhanced features
- **Q2 2026**: International expansion and partnership program

## 👥 Team

Our passionate and multidisciplinary team combines expertise in blockchain development, user experience design, and business strategy:

- **[Nicollas Isaac](https://www.linkedin.com/in/nicollas-isaac/)** - Blockchain Development & Systems Architecture
- **[Fernando Soares de Oliveira](https://www.linkedin.com/in/fernando-soares-de-oliveira/)** - User Experience & Product Design
- **[Davi Motta](https://www.linkedin.com/in/davi-motta/)** - Business Strategy & Growth

## 🔗 Links

- **Live Demo**: [iconic-seven.vercel.app](https://iconic-seven.vercel.app)
- **GitHub Repository**: [github.com/iconic-team-ofc/iconic](https://github.com/iconic-team-ofc/iconic)
- **Pitch Deck**: [Google Drive](https://drive.google.com/drive/folders/1dObvPZSFN1iL5Bf8d0ThJO20wS9cuBBa?usp=sharing)
- **X (Twitter)**: [x.com/iconic_xp](https://x.com/iconic_xp)
- **DEMO VIDEO**: [YouTube](https://www.youtube.com/watch?v=CDTBchRFWGE)
---

<div align="center">
  <p>Powered by Sui Blockchain</p>
  <p>© 2025 ICONIC. All rights reserved.</p>
</div>
