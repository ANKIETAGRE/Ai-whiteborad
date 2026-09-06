# 🪄 AI SaaS Architecture Whiteboard

[![Deploy to GitHub Pages](https://github.com/ANKIETAGRE/Ai-whiteborad/actions/workflows/deploy.yml/badge.svg)](https://github.com/ANKIETAGRE/Ai-whiteborad/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-6366f1?style=flat&logo=github)](https://ankietagre.github.io/Ai-whiteborad/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

An ultra-modern, interactive **AI-Driven Whiteboard & Architecture Canvas** built with React 19, TypeScript, Vite, and Tailwind CSS. Transform prompt descriptions into schema-validated system architecture diagrams, microservice layouts, mind maps, flowcharts, and sequence diagrams in seconds.

🔗 **Live Application:** [https://ankietagre.github.io/Ai-whiteborad/](https://ankietagre.github.io/Ai-whiteborad/)  
📁 **GitHub Repository:** [https://github.com/ANKIETAGRE/Ai-whiteborad](https://github.com/ANKIETAGRE/Ai-whiteborad)





## 🎨 How It Looks (Visual Interface & Architecture Canvas)

Below is an overview of the interface design, component layout, and user experience:

<img width="1915" height="875" alt="image" src="https://github.com/user-attachments/assets/df66bb4c-d42e-42ec-8745-5974b856bb38" />


### Key Visual Highlights

1. **Header Navigation Bar**:
   - **Title & Badge**: `AI SaaS Platform Architecture` with live category indicator (`Architecture`).
   - **Security Status Badge**: Glowing `🛡️ WAF & Prompt Shield Active` telemetry badge.
   - **Rate Quota Counter**: Real-time prompt quota tracking (`10/10 hr`).
   - **Utility Controls**: Instant access to `Security Logs` audit trail drawer, `Version History` snapshot modal, and `Export` (PNG / SVG / JSON).

2. **Top AI Prompt Dock**:
   - **Quick Presets**: One-click prompt chips (`AI SaaS Architecture`, `E-Commerce Microservices`, `Product Roadmap Mindmap`).
   - **Interactive Prompt Field**: Glassmorphic input field supporting natural language descriptions.
   - **Advanced Control Toggle (⚙️)**: Collapsible panel housing Diagram Type selection (Architecture, Flowchart, Mindmap, Sequence, Cloud) and Layout Engine algorithms to keep the primary prompt interface clean.

3. **Left Tool Dock**:
   - Sleek 1x vertical floating toolbar featuring Selection Mode, Vector Pen/Draw tool, Arrow/Connector tool, Shape insertion, Text edit mode, Auto-Layout Trigger, Canvas Boundary Reset, and Pan/Zoom Controls.

4. **Interactive Architecture Canvas (100% Scaled)**:
   - Default **100% 1:1 view scale** ensuring full visibility without extreme panning or boundary scrolling.
   - **Custom Diagram Nodes**: Dark glass cards with glowing border accents, service role sub-labels (`Frontend Client`, `Auth & Security WAF`, `Prompt -> Diagram JS...`, `Users & Diagrams`), and category badges (`SERVICE`, `GATEWAY`, `DATABASE`).
   - **Dynamic Bezier Curves**: Animated flow connectors with directional arrowheads and state labels (`HTTPS Request`, `Generate Diagram`, `Persist State`, `Save AI Schema`).

5. **Bottom-Right Utility Palette**:
   - Quick color picker dock, stroke size controls, and canvas clear options.

---

## ✨ Key Features

- 🤖 **AI Architecture Schema Generation**: Instantly parses natural language prompts into formatted node graph layouts with automatic positioning.
- 📐 **Diagram Types Supported**: Architecture canvas, Cloud infrastructure, E-Commerce microservices, Flowcharts, Mind maps, and Sequence diagrams.
- 🛡️ **Built-in Prompt Shield & WAF Telemetry**: Simulated enterprise WAF security monitoring and rate limiting.
- 🔍 **Smart Canvas Pan & Boundary Clamping**: Prevents lost components or excessive off-screen panning.
- 💾 **Version Control & History Snapshots**: Revert canvas states anytime using the visual history panel.
- 📤 **Multi-Format Export**: Export diagrams directly as high-resolution PNG, scalable SVG vector, or raw JSON schema.
- 🎨 **Ultra-Glassmorphic UI**: Custom backdrop filters, deep indigo/cyan gradients, and responsive layout engine.

---

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript
- **Bundler & Server**: Vite 6
- **Styling**: Tailwind CSS v4, Custom CSS Design Tokens & Glassmorphism
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti
- **CI/CD & Hosting**: GitHub Actions & GitHub Pages

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18.0 or later) installed on your system.

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ANKIETAGRE/Ai-whiteborad.git
   cd Ai-whiteborad
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Local Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Preview Production Build:**
   ```bash
   npm run preview
   ```

---

## ⚙️ GitHub Pages Deployment (CI/CD)

This repository includes an automated GitHub Actions pipeline (`.github/workflows/deploy.yml`) that automatically builds and deploys the application to **GitHub Pages** whenever code is pushed to the `main` branch.

### Manual Workflow Setup (if configuring on a fork):
1. Go to repository **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. Push changes to the `main` branch, and the workflow will automatically deploy your site!

---

## 📄 License

This project is licensed under the MIT License.
