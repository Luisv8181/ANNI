# Onboarding — GitHub (for Rahmat)

A no-jargon guide to getting the repo on your computer so you can read and edit everything. You're on a
MacBook, so these steps assume macOS.

## 1. Accept access
Luis will add you as a collaborator on **github.com/luisv8181/ANNI**. Check your email
(rahmat.21.malik@gmail.com) for the invite and click **Accept**. Make a free GitHub account first if you
don't have one.

## 2. See everything in the browser (easiest)
You don't strictly need to install anything to read or edit files:
- Go to **https://github.com/luisv8181/ANNI** → open the **`research/`** folder.
- Start at **`research/README.md`** and **`research/TRACKER.md`**.
- Then, in this order: **`PROTOCOL.md`** (the study), **`risk-matrix.md`** (the four risk levels),
  **`annotation-codebook.md`** (the rules for tagging), and **`glossary.md`** (any term you hit that
  you don't know). Everything is on the default branch — no branch switching needed.
- To edit a file (e.g., add a testimony to the intake register), click the **pencil ✏️**, make your
  change, scroll down, and click **Commit changes**. That's it — no install needed.

## 3. Get it on your computer (for the lab / annotation)
When you want to run things locally:

**a. Install GitHub Desktop** (simplest): https://desktop.github.com → sign in → **Clone a repository**
→ pick **luisv8181/ANNI** → Clone. Done. Use the "Fetch/Pull" button to get updates and "Commit + Push"
to save yours.

**b. Or use the terminal** (if you prefer):
```bash
# one-time: install git if needed (macOS will prompt to install developer tools)
git clone https://github.com/luisv8181/ANNI.git
cd ANNI
# get the latest anytime:
git pull
```

## 4. Everyday flow
1. **Pull** latest (GitHub Desktop "Fetch/Pull", or `git pull`).
2. Make changes.
3. **Commit** with a short message ("added 2 testimonies to intake").
4. **Push** so the team sees it.

## 5. Rules
- Log sources as **links first** in `research/sources/INTAKE-REGISTER.md`; don't paste full testimony
  text until Heath clears the license.
- Never commit anything sensitive (real patient data, private identifiers, API keys).
- When unsure, ask in the group — small commits are better than big risky ones.

Stuck? Message Luis — he's learning GitHub too, so we'll figure it out together.
