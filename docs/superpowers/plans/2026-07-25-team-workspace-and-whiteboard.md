# Team Workspace and Whiteboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Give ANNI a teen-friendly, whiteboard-style team workspace that carries approved study context through Reader, prompt generation, and Lab without enabling unapproved Wysa age paths.

**Architecture:** Store named ANNI workspace selection in browser local storage; it is not authentication and never stores third-party credentials. One focused team-workspace module defines roles, approved age context, and Wysa availability. The frontend renders that context, and the backend accepts only validated Luis/18+ prompt metadata. Blind scoring remains unchanged and receives no team or age metadata.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind, FastAPI, Pydantic, Vitest, Playwright.

---

## File structure

- lib/team-workspace.ts: source of truth for Luis, Rahmat, and Heath rules.
- components/team-workspace-picker.tsx: accessible workspace selector.
- components/study-context-card.tsx: active/deferred Wysa safety boundary.
- components/whiteboard-flow.tsx: reusable 2D flow map.
- app/page.tsx, app/reader/page.tsx, app/lab/page.tsx: team-aware workflow screens.
- backend/app/schemas.py, backend/app/main.py: validated prompt context.
- research/BUILD-LOG.md: milestone evidence.
- research/STARTUP-PACKET.md and research/team follow-up drafts: team handoff materials.

### Task 1: Add test support, workspace rules, and build log

**Files:**
- Modify: package.json
- Create: vitest.config.ts
- Create: lib/team-workspace.ts
- Create: lib/team-workspace.test.ts
- Create: research/BUILD-LOG.md

- [ ] Step 1: Add dev dependency vitest and scripts test = vitest run and test:watch = vitest. Create vitest.config.ts with node test environment and @ alias to the repo root.
- [ ] Step 2: Write lib/team-workspace.test.ts before implementation. Test that Luis returns allowed true and ageGroup 18+, Rahmat and Heath return allowed false and null ageGroup, and the workspace IDs are luis, rahmat, heath in that order.
- [ ] Step 3: Run npm test -- lib/team-workspace.test.ts. Expected result: fail because lib/team-workspace does not exist.
- [ ] Step 4: Implement lib/team-workspace.ts. Export WorkspaceId union luis | rahmat | heath; TeamWorkspace with id, name, role, nextAction, and wysa allowed/ageGroup/note; WORKSPACES; getWorkspace; canUseWysa; localStorage-safe getCurrentWorkspaceId, setCurrentWorkspace, and useCurrentWorkspace.
- [ ] Step 5: Run npm test -- lib/team-workspace.test.ts. Expected result: three passing tests.
- [ ] Step 6: Create research/BUILD-LOG.md. Record Milestone 1, exact changed files, the test command/result, and the active Luis/18+ plus deferred under-13/13-17 boundary.
- [ ] Step 7: Commit only these foundation files with message feat: add safe team workspace rules.

### Task 2: Build the selector and whiteboard home

**Files:**
- Create: components/team-workspace-picker.tsx
- Create: components/study-context-card.tsx
- Modify: app/page.tsx
- Modify: app/globals.css
- Test: lib/team-workspace.test.ts

- [ ] Step 1: Extend the workspace test to use a storage double and prove that selecting heath persists and reads back heath.
- [ ] Step 2: Run npm test -- lib/team-workspace.test.ts. Expected result: fail because persistence helpers are missing.
- [ ] Step 3: Add the minimum persistence helpers to lib/team-workspace.ts and run the test again. Expected result: pass.
- [ ] Step 4: Implement TeamWorkspacePicker as three large buttons. Each button names the person, role, current next action, and active/deferred state. Selection calls setCurrentWorkspace then refreshes routes that use current context.
- [ ] Step 5: Implement StudyContextCard. Luis shows Active Wysa pilot: 18+ only. Rahmat and Heath show Deferred: no Wysa account or age path is active, pending human approval.
- [ ] Step 6: Add whiteboard CSS tokens: paper background, 2px hand-drawn-style dashed border accents, violet/teal/amber/coral variables, 44px minimum touch targets, focus-visible rings, and reduced-motion fallback.
- [ ] Step 7: Render the picker and context card above the home hero. The selected workspace controls the welcome heading and primary next action.
- [ ] Step 8: Run npm test -- lib/team-workspace.test.ts and npm run build. Expected result: tests pass and Next build exits 0.
- [ ] Step 9: Append evidence to research/BUILD-LOG.md and commit with message feat: add team workspace selection.

### Task 3: Carry approved context into Reader, prompts, and Lab

**Files:**
- Modify: app/reader/page.tsx
- Modify: app/lab/page.tsx
- Modify: lib/api.ts
- Modify: backend/app/schemas.py
- Modify: backend/app/main.py
- Create: backend/tests/test_prompt_context.py

- [ ] Step 1: Write backend/tests/test_prompt_context.py before endpoint changes. Post a valid generated-prompt request with study_context operator Luis and wysa_age_group 18+, then assert status 200 and prompt contains STUDY CONTEXT: 18+ Wysa pilot.
- [ ] Step 2: Run backend/.venv/Scripts/python.exe -m pytest backend/tests/test_prompt_context.py -q. Expected result: fail because study_context is not implemented.
- [ ] Step 3: Add Pydantic StudyContext with operator Literal Luis and wysa_age_group Literal 18+. Add it as optional GeneratePromptRequest.study_context.
- [ ] Step 4: In generate_profile_prompt, append exactly STUDY CONTEXT: 18+ Wysa pilot; synthetic research profile, not a real person. only after Pydantic validates the optional context.
- [ ] Step 5: Add optional study_context to lib/api.ts. Reader passes it only when canUseWysa(currentWorkspace).allowed is true. Reader renders StudyContextCard.
- [ ] Step 6: Lab renders StudyContextCard. The Wysa responder button is enabled only for Luis; deferred workspaces retain ChatGPT choices and see the explicit reason. Working transcript export includes workspace and age context only when Luis/18+ is active.
- [ ] Step 7: Do not modify scoringItemsFromConversation, ScoringItemsFromConversation, scoring queue API, or score page. This prevents operator and age metadata entering blind scoring.
- [ ] Step 8: Run the backend test, npm test, and npm run build. Expected result: all commands pass.
- [ ] Step 9: Append evidence to the build log and commit with message feat: carry approved Wysa context through pilot workflow.

### Task 4: Add reusable whiteboard workflow navigation

**Files:**
- Create: components/whiteboard-flow.tsx
- Create: components/whiteboard-flow.test.tsx
- Modify: app/layout.tsx
- Modify: app/reader/page.tsx
- Modify: app/lab/page.tsx
- Modify: app/score/page.tsx
- Modify: app/globals.css

- [ ] Step 1: Write a failing render test: WhiteboardFlow active run must render Read, Mark, Build, Run, Score and assign aria-current step to Run.
- [ ] Step 2: Run npm test -- components/whiteboard-flow.test.tsx. Expected result: fail because the component is missing.
- [ ] Step 3: Implement WhiteboardFlow with linked Read, Mark, Build, Run, Score stages. The active stage has aria-current step. Use only approachable labels in visible UI.
- [ ] Step 4: Add it to Reader, Lab, and Score headers. The Score view may show the process stage but must not show operator, profile, Wysa age, risk, or hidden-key values.
- [ ] Step 5: Run npm test and npm run build. Expected result: pass and exit 0.
- [ ] Step 6: Append evidence to build log and commit with message feat: add whiteboard workflow navigation.

### Task 5: Create startup packet and unsent email drafts

**Files:**
- Create: research/STARTUP-PACKET.md
- Create: research/team/rahmat-follow-up-draft.md
- Create: research/team/heath-follow-up-draft.md
- Modify: research/BUILD-LOG.md

- [ ] Step 1: Write startup packet with local ANNI/device URL, clone/run steps, Antigravity tutorial link, coding-agent handoff prompt, GitHub account creation, repository access, and Wysa 18+ active/deferred boundaries.
- [ ] Step 2: Write Rahmat draft: local setup, source/annotation role, and no active Wysa age condition.
- [ ] Step 3: Write Heath draft: local setup plus explicit request to review Wysa terms, 13-17 eligibility/consent, and ethics/IRB requirements; state Luis/18+ is the only active Wysa pilot.
- [ ] Step 4: Add build-log evidence that both are drafts only and no email has been sent.
- [ ] Step 5: Commit with message docs: add ANNI startup packet and team email drafts.

### Task 6: Verify the local user journey

**Files:**
- Modify: research/BUILD-LOG.md

- [ ] Step 1: Run the webapp-testing helper with --help, then run a headless Playwright check at http://127.0.0.1:3100. Select Luis, navigate to Reader and Lab, and verify active 18+ context.
- [ ] Step 2: Select Rahmat and verify Wysa is unavailable with the deferred explanation.
- [ ] Step 3: Navigate to /score and verify an individual scoring item does not contain Luis, 18+, Wysa age, or a profile name.
- [ ] Step 4: Run npm test, backend/.venv/Scripts/python.exe -m pytest backend/tests -q, and npm run build. Expected result: all exit 0.
- [ ] Step 5: Record exact commands/results and browser evidence in research/BUILD-LOG.md. State that second-device testing remains a separate manual check unless performed.
- [ ] Step 6: Commit with message docs: record team workspace verification.

