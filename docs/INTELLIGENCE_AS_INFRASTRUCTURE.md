# Intelligence as Infrastructure

AI is not a visible feature. It is backend intelligence that powers system behavior.

## Philosophy

- **Users should never think:** "The AI suggested this."
- **Users should think:** "This system understands what matters."

Intelligence is expressed as:

- **Impact Score (0–100)** — from frequency, severity, sentiment, sessions, time decay, velocity stagnation
- **Risk Score** — from time open, owner load, dependency overlap, similar unresolved
- **Confidence %** — internal clustering reliability (no "AI" label)
- **Momentum** — resolution velocity trends

No AI marketing. No AI badges. No Sparkles in the UI for "AI features." Just intelligent ordering and prioritization.

## UI

- **Command Center:** "System overview" (not "AI Executive Summary"). High impact signals, at-risk signals, stalled clusters, resolution momentum, load distribution.
- **Signal Stream:** Default sort = impact, then risk, then time decay. Time decay indicator (visual bar by age). Rows: impact, risk marker, status, owner, last activity, cluster. System options like "Merge similar signals?" / "Consolidate duplicates?" — never "AI suggestion."
- **Execution Node:** No recommendation block. Collapsible "System analysis" (related signals, similar patterns, historical resolution, estimated effort, escalation probability). Label: contextual intelligence, no AI branding.
- **Context column:** "Related patterns" (not "AI Recommendations"). Neutral icon when collapsed.

## Backend engines (`lib/intelligence/`)

- **Impact Scoring** — `scoreImpact()` from frequency, severity, sentiment, sessions, decay, stagnation
- **Risk Forecast** — `scoreRisk()` from time open, owner load, overlap, similar unresolved
- **Clustering** — `assignCluster()` for cluster id/label
- **Time Decay** — `computeTimeDecayHours()` for prioritization
- **Velocity Analyzer** — `getResolutionVelocity()` for fast/normal/slow

These feed: sorting, alerts, momentum indicators, cluster groupings, merge suggestions, risk flags. All behavior; no hype.
