# Clone ANNI with the GitHub CLI (for you or your coding agent)

A short, reliable way to get the repo onto a computer using **`gh`** (the GitHub CLI). Works if you run
the commands yourself **or** if you hand the "paste to your agent" block below to a coding agent
(Antigravity, Claude Code, Cursor, etc.).

Repo: **`luisv8181/ANNI`** · default branch: **`master`** (everything lives here now).

---

## Before you start
- A **GitHub account**, and you've **accepted Luis's collaborator invite** (check email). Without the
  invite, the private repo won't be visible even though the URL is real.

---

## Do it yourself (5 commands)

**1. Install the GitHub CLI.**
- macOS: `brew install gh`  (if you don't have Homebrew, get it at https://brew.sh, or download gh from
  https://cli.github.com)
- Windows: `winget install --id GitHub.cli`

**2. Sign in.**
```bash
gh auth login
```
Answer the prompts: **GitHub.com** → **HTTPS** → **Login with a web browser** → copy the one-time code
it shows → press Enter → paste the code in the browser that opens → authorize. Done.

**3. (Optional) Confirm you can see the repo.**
```bash
gh repo view luisv8181/ANNI
```
If you see the README text, your access works. (Add `--web` to open it in a browser instead.)

**4. Clone it to your home folder.**
```bash
gh repo clone luisv8181/ANNI ~/ANNI
```

**5. Verify.**
```bash
cd ~/ANNI
git status          # should say: On branch master
ls                  # you should see app/ backend/ research/ …
```

That's it — the repo is now on your computer at `~/ANNI`.

---

## Paste this to your coding agent instead
If you'd rather let your agent do it, paste this:

```
Use the GitHub CLI to get a repository onto this machine. Explain each step briefly and pause before
anything that changes my system.

1. Check if "gh" (GitHub CLI) is installed; if not, install it (macOS: `brew install gh`).
2. Run `gh auth status`. If I'm not logged in, run `gh auth login` and walk me through the browser
   device-code login (GitHub.com, HTTPS, login with a web browser).
3. Verify access with `gh repo view luisv8181/ANNI` — if it fails, tell me I may need to accept a
   collaborator invite and stop.
4. Clone it: `gh repo clone luisv8181/ANNI ~/ANNI`.
5. `cd ~/ANNI`, then show me `git status` and the top-level folder list to confirm it worked.

Do not modify any of my other files. If a step errors, show the error and suggest a fix instead of
continuing.
```

(If you're setting up the whole lab, not just cloning, use the fuller
[`rahmat-antigravity-tutorial.md`](rahmat-antigravity-tutorial.md) — it clones **and** installs Ollama
and runs the app.)

---

## Everyday flow after cloning
```bash
cd ~/ANNI
git pull                       # get the team's latest changes before you work

# to make changes:
git checkout -b my-change      # a branch for your work (optional but tidy)
# …edit files…
git add -A
git commit -m "what I changed"
git push -u origin my-change   # then open a pull request on GitHub, or push to master if agreed
```

- **Just reading/annotating?** You only ever need `git pull` to stay current.
- **Where to put sources:** links go in `research/sources/INTAKE-REGISTER.md` (see
  [`sources/README.md`](sources/README.md)); don't commit unlicensed text.

## If it doesn't work
- `gh repo view` fails with "not found" → you probably haven't accepted the invite, or you're signed in
  to the wrong GitHub account (`gh auth status` shows who you are; `gh auth switch` to change).
- Ask your agent to paste the exact error back to you, or screenshot it to Luis.
