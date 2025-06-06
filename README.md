# BillBuddy

BillBuddy is a high-trust FinTech application that consolidates and automates household bill payments across mobile (iOS/Android) and web platforms. Built with Flutter for a unified codebase, BillBuddy enables seamless onboarding, OCR-based bill scanning, automated payments via Plaid, and a tiered pricing model. AI orchestration (WindSurf-AI) is used for code generation, testing, and deployment, minimizing manual coding and maximizing development velocity.

## Tech Stack
- **Flutter (Dart)**: Cross-platform mobile/web app
- **NestJS (Node/TypeScript)**: Backend API
- **Plaid**: Bank account integration
- **CI/CD**: GitHub Actions
- **AI Orchestration**: WindSurf-AI

## Frontend Source Location
The frontend (UI/UX, Builder.io logic, and all web client code) is maintained in a separate repository:

👉 [https://github.com/kineticn/Builder-zen-hub](https://github.com/kineticn/Builder-zen-hub)

Please refer to that repository for all UI, Builder.io, and frontend-related logic, as well as frontend CI/CD and documentation.

## Development Workflow
- All code changes via PRs; main branch protected by CI
- AI agents generate, test, and deploy code; developers review and debug
- Every feature must include unit + integration tests
- Secure coding enforced (no hard-coded secrets; use ENV vars)
- Linting and code comments required

<!-- Trigger CI/CD test again -->
