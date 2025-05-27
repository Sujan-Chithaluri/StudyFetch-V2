# StudyFetch - AI-Powered Study Assistant

StudyFetch is an AI-powered study assistant that helps you understand and learn from your PDF documents. Upload your study materials and chat with our AI tutor to get personalized explanations, generate flashcards, summaries, and citations.

---

## ✨ Features

- 📄 Upload and manage PDFs
- 🤖 Chat with AI about your document
- 🧠 Generate flashcards, summaries, and annotations
- 🔍 Search and highlight content
- 🧾 AI-generated citations and notes
- 👤 Secure authentication
- 🌐 Responsive design for desktop & mobile

---

## ⚙️ Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js
- **Storage:** Vercel Blob Storage
- **AI:** OpenAI API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted)
- Vercel account (for Blob storage)

---

### 1. Clone the repository

```bash
git clone project-url
cd folder-name
```
### 2. Install dependencies

```bash
npm install
```

---

### 3. Create and configure `.env`

Create a `.env` file at the root:

```bash
touch .env
```

Add the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/studyfetch"

# Auth
AUTH_SECRET="your-random-32-character-secret"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

or

# Anthropic
ANTHROPIC_API_KEY="your-anthropic-api-key"

```

To generate a secure `AUTH_SECRET`:

```bash
npx auth secret
```

---

### 4. Initialize the database

```bash
npx prisma migrate dev --name init
```

---

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

---

## 🧠 How to Use

1. Register or log in
2. Upload a PDF document
3. Chat with the AI about it
4. Generate flashcards, summaries, or citations
5. Export annotated PDF if needed

---

## 📦 Deployment

To deploy on **Vercel**:

```bash
npx vercel
```

Make sure to set all `.env` variables in your Vercel dashboard.

---

## Acknowledgments

- Built with Next.js, Prisma, and Tailwind CS
- Blob storage via Vercel
