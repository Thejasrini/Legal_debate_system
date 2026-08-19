# ⚖️ LexAgent — Simple & Complete Project Guide

Welcome to **LexAgent**! This document explains everything about how this project is built, what technologies are used, how the AI agents work together, and how the entire system runs step-by-step — in plain, simple language.

---

## 📌 1. What is LexAgent?

**LexAgent** is an **AI-powered Legal Debate Courtroom Simulator**. 

Imagine a real court where:
- A consumer has a problem (e.g. bought a broken laptop, seller refused refund).
- Two AI lawyers debate the case using **only official Indian Consumer Protection Act, 2019 law**.
- An AI Judge evaluates both arguments, checks the law, and delivers a fair verdict.

It does **not** guess or invent fake laws. It operates strictly as a **"Closed-Book" system**, meaning it can only use real legal text retrieved from the official Act!

---

## 🛠️ 2. Technologies Used (Tech Stack)

Here is a quick overview of all tools and libraries used in this project:

| Technology | Purpose / What it does |
| :--- | :--- |
| **React.js + Vite** | Powers the modern user interface (Frontend). |
| **Node.js + Express.js** | Powers the backend server and API endpoints. |
| **Google Gemini API** | The AI brain used by the agents to analyze law and formulate arguments (`gemini-flash-lite-latest`). |
| **ChromaDB** | **Vector Database** that stores the embedded text of the *Consumer Protection Act, 2019* PDF so the AI can search exact law sections instantly. |
| **MongoDB + Mongoose** | **Database** that stores case threads and conversation history so users can ask follow-up questions. |
| **Server-Sent Events (SSE)** | Streams the AI responses live to your screen line-by-line without long waiting times. |
| **Vanilla CSS** | Custom styling with **Dark & Light Mode** toggle, court-inspired colors (brass gold, parchment white, ink navy, emerald green, deep red). |

---

## 🤖 3. The Multi-Agent System (Who does what?)

Instead of asking a single AI to answer everything, LexAgent breaks the job down among **5 specialized AI agents**:

```
                  ┌───────────────────────────────┐
                  │      User Questions Input     │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │ 🔍 Intent Classifier Agent    │  (Checks if question is Consumer Law)
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │   ChromaDB Vector Retrieval   │  (Fetches relevant sections from CPA 2019)
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
┌────────▼────────────────┐                       ┌────────▼────────────────┐
│ 🟢 Support Agent        │                       │ 🔴 Oppose Agent         │
│ (Consumer Counsel)      │                       │ (Company Counsel)       │
└────────┬────────────────┘                       └────────┬────────────────┘
         │                                                 │
         └────────────────────────┬────────────────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │ 🛡️ Grounding Validator        │  (Filters out unretrieved/fake laws)
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │ ⚖️ Judge Agent (The Bench)    │  (Weighs arguments & issues verdict)
                  └───────────────────────────────┘
```

### Breakdown of the 5 Agents:

1. **🔍 Intent Classifier Agent (`intentAgent.js`)**:
   - **Job**: Acts as the court gatekeeper.
   - **What it does**: Checks if your question belongs to Consumer Law (e.g. defective products, refunds, warranties, misleading ads). If you ask about murder or land disputes, it politely tells you that the system only covers Consumer Protection Act 2019.

2. **🟢 Support Agent — Consumer Counsel (`supportAgent.js`)**:
   - **Job**: Acts as the lawyer for the consumer.
   - **What it does**: Searches the retrieved legal text to find consumer rights (e.g., Section 2 definition of defect, Section 39 refund orders, Section 83 product liability).

3. **🔴 Oppose Agent — Defense Counsel (`opposeAgent.js`)**:
   - **Job**: Acts as the lawyer for the seller / company.
   - **What it does**: Challenges the claim by pointing out that statutory remedies require formal proof and satisfaction of the District Commission before any refund can be ordered.

4. **🛡️ Grounding Validator (`groundingValidator.js`)**:
   - **Job**: Acts as the legal auditor.
   - **What it does**: Checks every section number cited by the Support and Oppose lawyers against the raw text fetched from ChromaDB. If a lawyer invents an unretrieved concept (e.g. IT Act safe harbour, courier disclaimers), it strips or flags it.

5. **⚖️ Judge Agent — The Bench (`judgeAgent.js`)**:
   - **Job**: Acts as the neutral Judge.
   - **What it does**: Listens to both Support and Oppose agents, compares their arguments against the real Act text, decides who wins (**Support**, **Oppose**, or **Inconclusive**), assigns a confidence score, and writes a clear decision.

---

## 🔄 4. How the System Works Step-by-Step

Here is what happens when you type a question on the website:

1. **User Types a Question**:
   - Example: *"I bought a laptop, but it stopped working after 3 days. The seller refused a refund."*

2. **Domain Classification**:
   - The **Intent Agent** checks the question and classifies it under `Defective Product` (Confidence: 95%).

3. **Smart Legal Search (RAG)**:
   - The backend converts the question into a mathematical vector and searches **ChromaDB**.
   - ChromaDB retrieves the top 4 most relevant law sections from the official 2019 Act PDF (e.g. Section 2, Section 39, Section 83).

4. **Live Streamed Debate**:
   - **Support Agent** generates consumer arguments and streams them live to your screen.
   - **Oppose Agent** generates company defenses and streams them live to your screen.
   - **Judge Agent** evaluates the case, triggers a **gavel strike animation**, and stamps a **VERDICT** seal badge!

5. **Memory & Follow-up Questions**:
   - The complete turn is saved to **MongoDB** (`threads` collection).
   - If you ask a follow-up question like *"What if they ignored my letter for 6 months?"*, MongoDB loads the previous laptop story, and the AI applies **Section 69** (2-year limitation period) without forcing you to retype everything!

---

## 🎨 5. User Interface Features

- **Dark & Light Mode Toggle**: Switch between **🌙 Dark Ink Navy Theme** and **☀️ Light Parchment White Theme** anytime with persistent `localStorage` memory.
- **Split Case Intake Hero**: Form on left, live **Petitioner vs Respondent** preview card on right.
- **Collapsible Case History**: View all previous turns in your case thread cleanly structured.
- **Responsive & Accessible**: Visible focus states and smooth transitions.

---

## 🚀 6. How to Run the Project

### Prerequisites:
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017`)
- Python + ChromaDB (`chroma run --path ./database`)

### Steps to Start:

1. **Start ChromaDB Vector Database**:
   ```bash
   chroma run --path ./database
   ```

2. **Start Backend Server**:
   ```bash
   cd backend
   node server.js
   ```
   *(Runs on http://localhost:5000)*

3. **Start Frontend Web App**:
   ```bash
   cd frontend
   npm run dev
   ```
   *(Runs on http://localhost:5173)*

---

### 📝 Summary
LexAgent is a complete **Retrieval-Augmented Generation (RAG)** legal system combining **Vector Search (ChromaDB)**, **Document Persistence (MongoDB)**, **Real-Time Streaming (SSE)**, and **Multi-Agent AI Reasoning (Gemini)** to deliver accurate, non-hallucinated legal debate!
