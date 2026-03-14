# Lumberjack

A spatial planning minigame that replaces a simple **lumberjack skill roll**. The player tries to maximise the final
value of cut timber on a grid by choosing **which trees to cut**, **which direction to fell them**, and occasionally
**rolling existing logs** to make space.

The game rewards planning, sequencing, and efficient use of limited actions — not reflexes. It is a tactical placement
puzzle.

## Key design principles

- **Sequencing is the real game.** The most important decisions are about order: which tree to cut first, which direction
  preserves space for later cuts, and when repositioning is worth the cost.
- **Long logs are the goal.** The scoring model strongly favours longer logs, so preserving room for tall trees is the
  central strategic tension.
- **Rolling is expensive on purpose.** Rolling a log costs as much as cutting a tree. That cost is what makes it a
  deliberate sacrifice rather than routine cleanup.
- **Character skill buys opportunity, not solutions.** Higher lumberjack skill reduces action cost, giving more moves
  within the same time budget — the puzzle stays the same, the player just has more room to perform.
- **Simple rules, emergent depth.** Complexity comes from the board state, not from rule exceptions. Secondary rules
  should stay as legible as possible.

## Core loop

1. Survey the grid of standing trees (each with a position and height)
2. Cut a tree in a chosen direction — it becomes a log occupying tiles equal to its height
3. Optionally roll an existing log to free space (full action cost)
4. Repeat until time/actions run out
5. Score based on the resulting log arrangement
