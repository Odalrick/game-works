# Lumberjack Minigame — Implementation Summary

## Purpose

A spatial planning minigame that replaces a simple **lumberjack skill roll**. The player tries to maximize the final
value of cut timber on a grid by choosing **which trees to cut**, **which direction to fell them**, and occasionally *
*rolling existing logs** to make space.

The game is meant to reward:

* planning
* sequencing
* efficient use of limited actions/time
* creating long, uninterrupted logs

It is not primarily about reflexes. It is a tactical placement puzzle.

---

## Core Gameplay

The board is a grid containing **standing trees**.
Each tree has at least:

* a position
* a height

On each turn, the player performs one action:

### Available actions

1. **Cut tree**

    * Select a standing tree
    * Choose a direction
    * The tree falls in that direction
    * It creates a straight log occupying a number of tiles equal to its height

2. **Roll log**

    * Select an existing placed log
    * Move it to create space
    * This costs the same as cutting a tree
    * It is intended as an expensive correction/optimization action, not routine play

The game ends when:

* time runs out, or
* action budget runs out, or
* there are no worthwhile remaining moves

Final score is based on the resulting arrangement of logs on the grid.

---

## Primary Design Goal

Create a minigame where the player is solving:

> “How do I arrange this forest so that I preserve or create the most valuable final log layout?”

The important gameplay is:

* choosing order of cuts
* choosing fall direction
* deciding when rolling a log is worth the cost
* protecting space for tall trees
* avoiding wasteful overlap/collisions

---

## Board Model

### Tile states

A tile may contain one of:

* empty ground
* standing tree
* placed log
* possibly destroyed/scrap tile, depending on final rules

### Tree data

Each tree should at minimum have:

* `position`
* `height`
* optional `type`

### Log representation

A log should likely be represented as a distinct entity rather than only a set of filled tiles, because rolling requires
selecting and moving a whole log.

Suggested log data:

* `id`
* `origin tree id`
* `length`
* `orientation`
* `occupied tiles`

---

## Cutting Rules

When a tree is cut:

* it is removed as a standing tree
* a log of length equal to tree height is placed in the selected direction

Open rule questions that need playtesting:

1. **What happens on overlap with existing logs?**

    * overlap destroys the incoming log tiles
    * overlap destroys the existing tiles
    * overlap destroys both / creates scrap
    * cut is simply illegal
2. **What happens if the fall would leave the board?**

    * illegal move
    * truncated log
    * wasted cut

Current design direction suggests that collision consequences should matter, because the game becomes more interesting
if space management is important.

---

## Rolling Rules

Rolling is a separate full-cost action.

### Intended function

Rolling exists to:

* recover from suboptimal earlier placements
* free space for a more valuable future cut
* enable access to tall-tree scoring opportunities

### Design intent

Rolling should feel expensive enough that:

* the optimal plan is usually to avoid needing it
* but it is clearly worth using in some high-value situations

### Likely rule

Simplest version:

* select a log
* move it one tile in a chosen direction if legal

Variants can be explored later, but the first implementation should stay simple.

---

## Scoring

### Core scoring intent

Long logs should be worth disproportionately more than short logs.

This is one of the central strategic drivers:

* preserving space for tall trees should matter
* breaking up the board into many short placements should feel inferior

### Scoring candidates discussed

#### Option A — Exponential weighting

Example:

* score of a log = `1.3^(length - 1)`

This strongly rewards longer logs.

**Insight:**
This captures the intended value curve well, but may be less legible to players and harder to tune intuitively.

#### Option B — Simple threshold bonus

Example:

* logs of length 1–2: normal value
* logs of length 3+: doubled value

This is easier to understand and introduces clear strategy without complexity.

**Insight:**
This may be preferable if the game should be immediately readable by players. It sacrifices some elegance for clarity.

### Recommendation

Prototype both:

* one with exponential scoring
* one with threshold/double scoring

Then compare:

* whether players naturally understand the scoring
* whether tall-tree prioritization feels strong enough
* whether the game produces interesting tradeoffs

---

## Difficulty Scaling

The minigame scales well through board generation and rules.

### Natural scaling axes

* grid size
* number of trees
* tree height distribution
* density of tree placement
* tree types, if used

### Observed insight

This game’s difficulty mostly comes from **combinatorial planning pressure**, not input complexity.
That is a good fit for a minigame replacing a skill roll, because it makes player decisions matter without requiring
twitch mechanics.

---

## Character Skill Integration

Character skill should make the game easier **without replacing the gameplay**.

### Strong candidate: action cost reduction

Base rule example:

* each action costs 10 minutes

Higher lumberjack skill:

* reduces time cost per cut/roll
* gives more total effective actions within the same work session

This is a strong fit because it:

* preserves the puzzle
* does not trivialize good planning
* allows skilled characters to exploit more opportunities

### Why this works

It satisfies the design requirement that character skill should be a **handicap reduction**, not simply “make the puzzle
easier” by removing challenge.

Possible later additions:

* preview fall path
* limited undo
* reduced penalties for mistakes

But action-time reduction is already sufficient and elegant.

---

## Implementation Priorities

## Phase 1: core prototype

Implement:

* grid
* random tree placement
* tree heights
* cut action
* directional falling
* placed logs
* simple legal/illegal collision rules
* end condition
* score calculation

Goal:

* verify whether the core puzzle is fun before adding complexity

## Phase 2: rolling

Add:

* selectable logs
* roll action
* full action/time cost
* basic movement legality

Goal:

* test whether rolling adds meaningful planning depth rather than tedious cleanup

## Phase 3: scoring experiments

Implement switchable scoring modes:

* exponential
* threshold bonus

Goal:

* compare readability and strategic incentives

## Phase 4: progression/scaling

Add:

* more varied tree distributions
* larger boards
* optional special tree types
* tighter time budgets

---

## Key Design Insights Found

### 1. The real game is sequencing

The most important part is not “can I place this tree?” but:

* in what order should I solve the forest?
* when is it correct to spend a whole action on repositioning?

### 2. Rolling is valuable because it is expensive

Rolling only works if it is costly enough to feel like a deliberate sacrifice.
That cost is what creates strategic tension.

### 3. Long-log incentives are the heart of the puzzle

Without a strong reward for long logs, the game risks collapsing into generic space filling.
The scoring model must strongly favor preserving room for tall trees.

### 4. Simplicity of rules matters

The game’s natural depth comes from the board state.
Because of that, secondary rules should stay as simple and legible as possible, especially in the first version.

### 5. Character skill should buy opportunity, not solve the puzzle

Reducing time per action is a particularly good fit because it keeps the player playing the same game, just with more
room to perform well.

---

## Defined Use Cases

### Use case 1: replace a lumberjack skill check

Instead of:

* “roll lumberjack, get X wood”

Use:

* play the minigame
* resulting score determines wood yield / quality / profit

### Use case 2: reward player mastery beyond character stats

A skilled player can outperform expectations through:

* efficient sequencing
* preserving long placements
* minimizing need for rolls

### Use case 3: let character skill still matter

A skilled character gets:

* more actions in the same work period
* better capacity to convert player skill into result

### Use case 4: scalable content

Different jobs can be generated by varying:

* board size
* forest density
* height profile
* available time

This makes the minigame reusable in multiple contexts.

---

## Open Questions for Playtesting

These should be resolved by testing, not theory alone:

* Are collisions more fun as illegal moves or destructive outcomes?
* Should out-of-bounds falls be illegal or partially wasted?
* Does rolling one tile at a time feel good, or too fiddly?
* Does exponential scoring feel satisfying or opaque?
* Does threshold bonus scoring create enough incentive for tall trees?
* What board sizes produce meaningful decisions without becoming tedious?
* How often should a good player need to roll logs?

---

## Minimal Ruleset Recommendation

For the first playable version:

* square grid
* random trees with heights
* cut in 4 directions
* illegal if placement would overlap or go out of bounds
* score = sum of log values
* use either:
    * exponential value by length, or
    * simple doubled score for length 3+
* each action costs time
* higher lumberjack skill reduces time cost
* add rolling only after confirming the cut-only puzzle is fun
