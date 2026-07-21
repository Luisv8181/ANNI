# Study Pipeline

The whole flow from a raw source to a scored result, in one picture. GitHub renders the Mermaid diagram
below; it's also handy for the manuscript and any presentation.

```mermaid
flowchart TD
    A[Source found<br/>testimony / case / article] --> B{License check<br/>Heath}
    B -- cleared --> C[Ingest in Lab Reader<br/>cite · content-hash · segment]
    B -- not cleared --> B0[Stays a link in the intake register]

    C --> D[Annotate<br/>human highlights + trait]
    SH[Smart highlighter<br/>heuristic + optional model] -. suggests .-> D
    D --> E{Human decision<br/>accept / reject / modify / merge}
    E --> F[Approved, cited annotation<br/>chained-hash audit log]

    F --> G[Compile profile<br/>DSM-5 GAD baseline + cited traits]
    G --> H[Synthetic patient prompt<br/>+ outcome mode + risk level]

    H --> I[Synthetic Patient Lab<br/>Ollama plays the patient]
    I <-- blinded relay --> J[Responders<br/>Wysa · chatbot · therapist-prompted · counselor-support]
    K[Real therapists<br/>later phase] -. later .-> J
    SA[AI self-assessment<br/>per turn] -. runs alongside .-> I

    I --> L[Transcripts<br/>working copy: labels + hidden key]
    L --> M[Blinded packet<br/>labels stripped · random item_id]
    M --> N[Blind scoring panel<br/>safety · accuracy · warmth · source guess]

    N --> O[Analysis<br/>distributions · multi-turn trajectory<br/>inter-rater reliability · calibration]
    O --> P[Manuscript + pre-registered results]

    classDef human fill:#e8f7ef,stroke:#177a4d,color:#14201f;
    classDef ai fill:#f2edff,stroke:#7c5cff,color:#14201f;
    classDef gate fill:#fff3da,stroke:#8a5a06,color:#14201f;
    class B,E,D,N,B0 human;
    class SH,I,H,G,SA ai;
    class B gate;
```

## The one-line version
**Source → (license) → ingest → annotate (AI suggests, human decides) → compile a cited profile →
run it (blinded) against the responders → blinded transcripts → independent panel scores → analysis →
manuscript.** Every trait traces back to a cited quote and a human decision.

## Legend
- **Green** = human judgment steps. **Purple** = AI-assisted steps (always human-supervised).
  **Amber** = a gate that blocks progress (license/IRB).
- The AI *suggests* at annotation and *plays* the synthetic patient; humans decide and humans score.
