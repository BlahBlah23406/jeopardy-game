# AI Jeopardy Trivia Game

A modern, highly interactive, and beautiful Jeopardy-style trivia game built with React, TypeScript, and TailwindCSS. It integrates Google Gemini AI to dynamically generate customized trivia categories/questions and intelligently verify typed player answers.

## 🚀 Features

- **Dynamic AI Game Generation**: Instantly generate 6 categories with 5 escalating questions, plus Final Jeopardy and tie-breaker questions, using a single topic prompt powered by **Gemini 2.5 Flash**.
- **AI Answer Verification**: Submit player attempts for live grading. The built-in AI trivia judge handles minor typos, spelling variations, and articles strictly but fairly, complete with custom explanations.
- **Roster & Rotation Management**: Organize players into teams and enforce a rotational representative system so that all players get active game time.
- **Advantage Cards & Modifiers**:
  - **★ Double Points**: Double the value of the next selected question.
  - **★ Steal Turn**: Override selection priority to grab the next question first.
  - **★ Reset Roster**: Instantly reset the team representative rotation.
- **Double Jeopardy**: Hidden double-points questions randomly integrated into the board.
- **Polished UX**: Seamless micro-animations and transitions powered by **Framer Motion**, featuring a beautiful dark-mode interface with vibrant neon accents.

## 🛠️ Tech Stack

- **Frontend**: React (18.2), TypeScript, Vite
- **Styling**: TailwindCSS, Framer Motion, Lucide Icons
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Testing**: Vitest, React Testing Library

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/BlahBlah23406/jeopardy-game.git
cd jeopardy-game
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Run tests
```bash
npm run test
```

### 5. Build for production
```bash
npm run build
```

## 🔑 AI Key Setup

To use the AI generation and verification features:
1. Obtain an API key from Google AI Studio.
2. Enter your key inside the application's configuration modals (it is saved securely to `localStorage` so you don't have to re-enter it every session).

## 📄 License

MIT License. Feel free to use and adapt this project for your own trivia sessions or portfolio!
