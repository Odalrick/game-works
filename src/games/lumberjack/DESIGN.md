# Lumberjack — Design

## Board Model

### Tile states

A tile may contain one of:

* empty ground
* standing tree
* placed log

### Tree data

Each tree has:

* `position` (derived from grid index)
* `height` (2–6)

### Log representation

Logs are stored as individual tiles with an orientation (N, S, E, W, NS, EW). The orientation encodes which end of the
log a tile is, or whether it is an interior segment. Contiguous same-axis log tiles form a single logical log for
scoring.

Rolling will require identifying a whole log from its tiles. The current tile-based representation supports this through
adjacency search.

---

## Actions

On each turn, the player performs one action.

### Cut tree

* Select a standing tree
* Choose a cardinal direction (N, S, E, W)
* The tree falls in that direction
* It creates a straight log occupying tiles equal to its height
* The tree's original tile becomes empty

### Roll log

* Select an existing placed log
* Move it one tile in a chosen direction if legal
* This costs the same as cutting a tree
* It is intended as an expensive correction/optimisation action, not routine play

Rolling exists to:

* recover from suboptimal earlier placements
* free space for a more valuable future cut
* enable access to tall-tree scoring opportunities

### End condition

The game ends when the action budget runs out or the player chooses to stop.

---

## Cutting Rules

When a tree is cut:

* it is removed as a standing tree
* a log of length equal to tree height is placed in the selected direction

### Collision with existing logs

Felling a tree onto an existing log destroys the overlapping tiles of the existing log. The incoming log is placed
normally. This makes space management important — careless cuts degrade earlier work.

### Collision with standing trees

A tree cannot be felled onto another standing tree. The cut is invalid.

### Out-of-bounds fall

A tree can be felled towards the board edge. Log tiles that would land outside the grid are simply lost. The remaining
portion is placed normally. This means felling a short tree near an edge is safe, but felling a tall tree towards a
nearby edge wastes most of its length.

---

## Scoring

The prototype supports two selectable scoring modes. Both reward long logs, but they create different strategic
incentives.

### Mode A: Threshold bonus (current default)

* Score per log = length
* Logs of length 3+: score = length × 2

The player sees "keep logs long" as the obvious goal. Collisions that break existing logs are purely destructive.

### Mode B: Log count bonus

* Score per log-tile = 1
* Bonus per log of length 3+: +3

This rewards having *more* logs. A well-placed collision that splits an existing long log into two shorter-but-still-long
logs can be optimal — the player gains a +3 bonus for the new log at the cost of some tiles. This makes deliberate
crashing a viable tactic rather than always a mistake.

### Strategic difference

* Mode A: protect existing logs at all costs, maximise unbroken length
* Mode B: sometimes sacrifice length to create additional qualifying logs

The threshold (length 3+) is configurable in both modes (`config.log.doublePoints`).

### Fictional context

Different scoring modes let the same minigame express different jobs. An oak camp cutting timber for ship keels wants the
longest possible logs — mode A. A pine camp producing planks of a certain length rewards precut logs of the right size —
mode B. The mechanics stay the same; the scoring tells the player what the job values.

---

## Prototype Sliders

This prototype exists to test how the minigame feels, not to integrate with a parent game. Two sliders stand in for the
eventual integration points:

### Difficulty

Controls board generation parameters:

* grid size
* number of trees
* tree height distribution

Higher difficulty means a denser, more constrained board with harder planning decisions.

### Skill

Controls the action budget. A higher skill setting gives more actions within the same session. This mirrors the intended
character-skill integration (where a skilled lumberjack works faster), without needing an actual character system.

---

## Implementation Priorities

### Phase 1: core prototype (done)

* Grid with seeded random tree placement
* Tree heights (2–6)
* Cut action with directional felling
* Log orientation model
* Prediction system (plan action → preview → validate → execute)
* Collision rules (destroys existing logs, blocked by trees, truncated out of bounds)
* Threshold scoring
* Text-based `present()` for testing

### Phase 2: rolling

* Identify whole log from tile adjacency
* Roll action: move entire log one tile in a chosen direction
* Full action cost (same as cut)
* Movement legality (blocked by trees, board edge, other logs)

### Phase 3: action budget and end condition

* Configurable action budget
* Game-over state when budget is exhausted or player stops
* Wire up the skill slider to control the budget

### Phase 4: UI

* Visual grid with clickable tiles
* Tree and log rendering
* Action selection (click tree → choose direction)
* Prediction overlay (show where the log will land before confirming)
* Score display
* Difficulty and skill sliders
* New game / reset

---

## Key Design Insights

### 1. The real game is sequencing

The most important decisions are about order: which tree to cut first, which direction preserves space for later cuts.

### 2. Rolling is valuable because it is expensive

Rolling only works if it is costly enough to feel like a deliberate sacrifice. That cost is what creates strategic
tension.

### 3. Long-log incentives are the heart of the puzzle

Without a strong reward for long logs, the game risks collapsing into generic space filling. The scoring model must
strongly favour preserving room for tall trees.

### 4. Simplicity of rules matters

The game's natural depth comes from the board state. Secondary rules should stay as legible as possible.

---

## Open Questions for Playtesting

* Does rolling one tile at a time feel good, or too fiddly?
* What board sizes produce meaningful decisions without becoming tedious?
* How often should a good player need to roll logs?
* Is the threshold bonus enough incentive, or should the multiplier or threshold be adjusted?
* What distribution of trees produce a compelling game loop?
