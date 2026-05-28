# BankIQ — AI-Powered Banking Assistant

> A demo AI SaaS portfolio project that combines Supabase, Dify (LLM services), and a modern TypeScript frontend to deliver intelligent banking assistants and knowledge-base driven chatflows. 🚀

---

## Product Overview

BankIQ is a portfolio-grade AI SaaS demo that showcases conversational AI, KYC checks, and knowledgebase-driven responses for banking applications. It pairs a Vite + TypeScript frontend with Supabase for auth & persistence and Dify for LLM-powered features.

## Problem Solved

- Banks and fintechs need a secure, customizable assistant to surface product knowledge, answer customer queries, and perform lightweight KYC flows without building models or infra from scratch.
- BankIQ demonstrates how to glue authentication, storage, and LLMs into a secure, developer-friendly stack.

## Solution Architecture

```mermaid
flowchart LR
  subgraph FE [Frontend]
    A[Browser (React / Vite)] -->|RPC / REST| B[Server (Edge / Node)]
  end
  subgraph BE [Backend / Services]
    B --> C[Supabase (Auth, DB, Storage)]
    B --> D[Dify (LLM + KYC workflows)]
  end
  C --> E[Database / Migrations]
  D --> F[Model APIs / LLM pipelines]
  style FE fill:#f9f,stroke:#333,stroke-width:1px
  style BE fill:#ff9,stroke:#333,stroke-width:1px
```

This diagram shows the browser frontend calling server functions that interact with Supabase for auth and persistence, and Dify for LLM/AI workloads.

## Features ✨

- Authentication and session handling via `Supabase` (email/password, JWT session).
- Knowledgebase-driven chat with LLM augmentation via `Dify`.
- KYC / verification mode hooks (pluggable `DIFY_KYC_API_KEY`).
- Server-side middleware for secure access to secrets and RPC endpoints.
- Example migrations and project configuration for Supabase.

## Workflow Explanation

1. User signs in via Supabase auth on the frontend.
2. Frontend calls server endpoints (RPC/server functions) to read/write data.
3. Server attaches user context and calls Dify endpoints for LLM responses or KYC checks.
4. Results are stored or indexed in Supabase, and responses are returned to the UI.

## Tech Stack

- Frontend: TypeScript, React, Vite
- Backend: Edge/Node server functions (project sources in `Frontend/src/server.ts`)
- Auth & DB: Supabase (see `Frontend/supabase/`)
- LLM / AI: Dify (see `Frontend/src/lib/dify.functions.ts`)
- Bundler / runtime: Bun / Vite

## Installation (local)

Prerequisites: Node.js or Bun, Git, and a Supabase project + Dify API keys.

```bash
# clone
git clone <your-repo-url>
cd BankIQ

# install dependencies (npm / yarn / bun)
cd Frontend
npm install
# or
bun install

# copy env example
cp Frontend/.env.example Frontend/.env
# fill in secrets in Frontend/.env locally (do NOT commit)

# run locally
npm run dev
# or
bun run dev
```

## Environment Variables

Add these to `Frontend/.env` (or your deployment environment). Do NOT commit real values — use the `.env.example` as a template.

- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY` — Supabase publishable key (client)
- `VITE_SUPABASE_PROJECT_ID` — Supabase project id (for local config)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Publishable key for Vite frontend
- `VITE_SUPABASE_URL` — Vite-friendly variable for Supabase URL
- `DIFY_API_KEY` — LLM API key for general AI calls
- `DIFY_KYC_API_KEY` — (optional) Key for KYC-specific flows

See `Frontend/.env.example` for placeholders.

## Screenshots

Included in the repo: see the `Screenshots/` folder for static images of the UI and admin views.

Examples:
- ![Login screenshot](Screenshots/1.%20BankIQ_Lovable%20Client%20login-page_screenshot1.png)
- ![Dashboard](Screenshots/2.%20BankIQ_Client%20login-page_screenshot2.png)

GIF demos
- Add animated walkthrough GIFs to `docs/gifs/` and reference them here:

```markdown
![Demo](docs/gifs/demo-chatflow.gif)
```

## Architecture Diagram

Included above (Mermaid) — you can render it on GitHub or via Mermaid live editor. For a PNG/SVG export, run a Mermaid renderer or add a generated image to `docs/diagrams/`.

## Deployment Links

Add your deployment URLs here once deployed. Example placeholders:

- Staging: https://bankiq-staging.example.com
- Production: https://bankiq.example.com

To deploy:

1. Create a Supabase project and set the environment variables in your deployment platform (Vercel, Netlify, Fly, etc.).
2. Configure Dify API keys as secrets in the deployment settings.
3. Push and deploy from your Git remote.

## Future Roadmap 🛣️

- Add multi-tenant support and per-tenant data isolation.
- Expand KYC flows with document OCR & automated checks.
- Add analytics dashboard for conversation metrics and RLHF feedback.
- Add CI checks to scan for secrets before push (pre-commit hooks + GitGuardian/TruffleHog integration).

## Creator

- Creator: Your Name — contact@example.com
- Repo: Replace with your public repo URL

## License

This project is provided under the MIT License — see `LICENSE`.

---

If you'd like, I can:

- add GIF demo placeholders to `docs/gifs/` and wire them into this README
- render the Mermaid diagram to PNG and place it in `docs/diagrams/`
- push the README and optional images as a commit

Would you like me to commit the README and push it to a remote? 🎯