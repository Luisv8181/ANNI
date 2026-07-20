# System Prompts

Every prompt the study uses, versioned here so we all run the **same** wording and can cite exact
versions in the pre-registration. Treat these like code: change them with a commit and a note, and
bump the version number at the top of each file.

## The pieces and how they fit together

```
                          ┌──────────────────────────┐
                          │   simulated-client.md    │  ← one AI plays the GAD "client",
                          │   (planted risk cues)    │    with a hidden risk level per case
                          └────────────┬─────────────┘
                                       │ sends messages to ↓
        ┌──────────────────────────────┴──────────────────────────────┐
        │                                                              │
  SETUP A (autonomous)                                          SETUP B (human-in-the-loop)
  ┌──────────────────────┐   ┌──────────────────────┐          ┌──────────────────────────┐
  │  direct-to-user.md   │   │  chatgpt-therapist.md│          │  counselor-support.md    │
  │  (plain chatbot)     │   │  ("act like a        │          │  (AI advises a human;    │
  │                      │   │   therapist")        │          │   human replies)         │
  └──────────────────────┘   └──────────────────────┘          └──────────────────────────┘
        │                          │                                     │
        └──────────────┬───────────┘                                     │
                       ▼                                                  ▼
              transcript to score  ◄───────────────────────────  transcript to score
                       │                                                  │
                       └──────────────► ai-self-assessment.md ◄───────────┘
                          (after each turn, the responder rates its own
                           "mental state" / confidence — Rahmat's new idea)
```

## The three responder conditions

The study compares how the **same underlying model** behaves under different instructions/structures:

1. **`direct-to-user.md`** — a general chatbot with no special role. Baseline.
2. **`chatgpt-therapist.md`** — the same model *told to act like a therapist*. (This is the prompt Luis
   asked to have ready — the "chatbot told to be a therapist" responder from the protocol.)
3. **`counselor-support.md`** — the same model as a **clinical assistant**: it does not reply to the
   client; it writes an analysis + a suggested response for a human counselor to review. This is the
   **human-in-the-loop** arm and the heart of the study. It mirrors ANNI's rule: *AI suggests, humans decide.*

## Rules for running

- **Pin the model + settings.** Record model name, temperature, and date in each transcript. The
  literature shows scores swing wildly with configuration, so we hold it fixed and log it.
- **Fresh context per case.** Start a new conversation for every vignette so cases don't bleed together.
- **Multi-turn.** Run ~20 back-and-forth turns per case (see PROTOCOL). Multi-turn is the point —
  safety degrades as conversations lengthen.
- **Blind the scorers.** Never label which condition produced a transcript when it goes to the panel.

## Safety framing (read once)

These prompts are instruments in a safety **evaluation**. The therapist-style prompts are things we
**test**, not services we deploy. The simulated client deliberately contains crisis cues so we can
measure whether responders detect and escalate them — it is synthetic and must never be represented
as a real person. See each file's header for its specific guardrails.
