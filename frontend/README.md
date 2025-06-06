# BillBuddy Frontend (Builder.io UI/UX)

<!-- Test commit for backend sync workflow -->

This folder is dedicated to all UI/UX work for the BillBuddy project, including:
- Builder.io AI-generated pages and components
- Figma design exports
- UI assets (images, icons, etc.)
- Design documentation and prompts

## How to run just the UI (Frontend)

1. Open a terminal and navigate to this directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit the local URL provided by Vite (usually http://localhost:5173)

## Instructions for Builder.io
- Use this folder as the root for all frontend and UI/UX code.
- Reference the DESIGN_BRIEF.md in the main project root for detailed requirements and style guide.
- All generated code, assets, and documentation should be placed here.

## Collaboration
- Frontend/UI/UX contributors should work within this folder.
- Backend and infrastructure code should remain outside this folder to keep concerns separated.

---

**If you have exported code or assets from Builder.io, place them in this folder or subfolders as appropriate.**

---

## 🛡️ Frontend Testing, Coverage, and CI Rules (Builder.io AI & Tanner)

### Coverage & Testing Expectations
- **All frontend logic/components/utilities must be covered by direct unit tests** (importing modules/components directly, not just via end-to-end tests).
- **Integration/e2e tests** are valuable for user flows, but only unit tests count toward coverage in Codecov.
- **Each time a new frontend file is added,** add at least one direct unit test for its exports.

### How Coverage Works
- **Vitest** is configured to instrument all source files and output coverage to `frontend/coverage/lcov.info`.
- **Coverage is only counted for code executed in the same process as Vitest.**
    - Direct unit/component tests: ✅
    - e2e/browser tests: ❌ (not counted for coverage)
- **Codecov** receives coverage from `frontend/coverage/lcov.info` after CI runs.
- If coverage drops or is missing, check that:
    - The file is imported and exercised in a Vitest test.
    - The file is included in the project and not ignored in config.

### Adding/Updating Tests
- Place new unit/component tests in `frontend/tests/`.
- Import the module/component directly, e.g.:
  ```js
  import { BillFragment } from '../src/graphql/fragmentMap';
  ```
- Cover all major logic and error paths.
- Run `npm run coverage` and check `coverage/lcov-report/index.html` locally before pushing.

### Internal AI/Team Notes
- **Builder.io AI (Claude) and Tanner** are responsible for frontend development and coverage.
- **WindSurf AI (GPT-4.1) and Tanner** are responsible for backend development.
- All frontend coverage/debugging lessons and rules should be documented here for future reference.
- If new issues arise, update this section so Builder.io AI can reflect and avoid repeated mistakes.

---

## Quick Reference: Debugging Coverage
- If coverage is 0% for a file:
    - Add a direct unit test importing and calling its exports.
    - Ensure the export is present in the module.
- If CI/CD fails on coverage:
    - Check for missing exports or test files.
    - Review this README for rules and troubleshooting steps.

---

*Last updated: 2025-06-06 by Builder.io AI & Tanner*
