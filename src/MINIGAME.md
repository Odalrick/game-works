# Minigame — Functional Summary

## Purpose

A minigame is a **self-contained gameplay module** embedded inside a larger game, used to resolve a situation that might
otherwise be handled by a simple stat check, roll, or abstract calculation.

Its job is to:

* let the **player’s own skill or judgment** matter
* still allow **character skill** to matter
* produce a **result that the parent game can use**
* be substantial enough to feel like a game, not just a mechanic

In this framework, a minigame is not just “interactive resolution.” It is a distinct playable activity.

---

## Core Definition

A minigame is a small game within the larger game that:

1. has its **own internal rules**
2. requires a **sequence of decisions and/or actions**
3. produces a **meaningful outcome**
4. is long enough and rich enough to feel like a **complete gameplay unit**

This excludes isolated mechanics that are only single-step inputs.

---

## Important Distinction: Mechanic vs Minigame

A single mechanic is **not automatically** a minigame.

Example:

* “stop a moving power bar at the right point” is a mechanic
* by itself, that is usually **not** a minigame

It can become part of a minigame if it exists inside a larger decision structure.

Example:

* selecting and ordering up to ten actions/items, then resolving with a power gauge
* here, the power gauge is only one element
* the overall sequence forms the minigame

### Key insight

A minigame is defined more by its **whole decision loop** than by any individual interaction inside it.

---

## Qualification Criteria

For this design framework, something should generally qualify as a minigame only if it satisfies most of the following.

## 1. Self-contained ruleset

The activity must have rules that can be understood and played as a discrete unit.

It may borrow systems from the main game, but it must still function as its own bounded play activity.

## 2. Multi-step interaction

A minigame should involve more than one trivial input.

It should contain a sequence such as:

* planning then execution
* repeated actions under constraints
* multiple related choices
* state changes that matter over time

This is one of the most important constraints.

## 3. Player agency

The player must have meaningful influence over the result.

That influence can come from:

* strategy
* planning
* execution
* prioritization
* controlled risk-taking

Pure randomness, or near-randomness with token interaction, is not enough.

## 4. Scorable or interpretable output

The minigame must produce a result usable by the outer game.

Examples:

* pass / fail
* quality tier
* amount of resource produced
* degree of success
* payout
* time saved or lost

## 5. Supports scaling

A good minigame should scale along one or more axes:

* difficulty
* stakes
* action budget
* board size
* speed
* complexity
* risk
* output ceiling

## 6. Character skill can modify it without replacing it

The larger game’s character stats should be able to help, but should not usually erase the gameplay.

Character skill should preferably:

* reduce handicap
* grant more room for success
* reduce cost of mistakes
* improve opportunity

rather than:

* automatically solve the minigame
* convert it back into a disguised stat roll

## 7. Feels substantial

A minigame should feel like a brief but complete play experience.

That does not require it to be long in absolute time, but it should be rich enough that the player feels they **played
something**, not merely triggered an animation with timing input.

---

## Enjoyment Requirement

A minigame does **not** have to be strongly fun in isolation.

Because a minigame is:

* embedded in a larger game
* short in duration
* context-dependent in meaning

it can justify itself even if its standalone entertainment value is limited.

This distinguishes minigames from full games.

A full game usually must carry the player's interest on its own.
A minigame can instead succeed by:

* adding texture
* changing pacing
* expressing a type of task
* making a skill check feel less abstract
* introducing a little agency or variation

So the requirement is not:

> "Is this fully fun as a standalone game?"

but more:

> "Does this add enough value to the surrounding game to justify its presence?"

### Key insight

A minigame may be:

* mildly engaging
* merely acceptable
* situationally satisfying
* even somewhat boring

and still be valid, as long as it serves the parent game well enough.

Of course, a genuinely fun minigame is better.
But fun is a strong positive, not a strict qualification requirement.

---

## Functional Requirements of a Good Minigame

A strong minigame candidate should ideally support the following.

## Difficulty scaling

A better player should be able to attempt harder variants through real skill.

Examples:

* denser board
* more complex state
* tighter resource limits
* more volatile risk/reward structure

## Handicap scaling

Character skill should make the minigame easier in ways that preserve gameplay.

Examples:

* more time
* more actions
* clearer previews
* fewer penalties
* wider success windows

## Scalable result

The game should produce output on a spectrum, not only binary success where possible.

This makes minigames more reusable and more expressive.

## Potential for high performance

The system should allow excellent play to produce excellent results.

This gives mastery meaning.

## Bounded fiction

Even when performance scales well, it should still remain within the logic of the parent game.

Example:

* a waitressing minigame should not produce absurdly unbounded money
* a jumping minigame should not imply jumping to the moon

### Key insight

Good scaling often means:

* **mechanically open enough** to reward mastery
* **fictionally bounded enough** to stay believable

## Repeat tolerance

Because minigames are often repeated:

* their novelty can wear off
* their optimal patterns can become obvious
* their friction can become tiresome

A minigame should therefore be evaluated not only on:

* first-play interest
* mechanical quality

but also on:

* repeat tolerance
* how irritating it becomes when mandatory
* how much it slows the surrounding game loop

Even a decent minigame may degrade over time.

## Skippability

Skippability is not logically required for something to count as a minigame.

However, as a design rule, minigames generally **should be skippable**.

Since minigames:

* may be only moderately enjoyable
* may become repetitive
* are subordinate to the larger game

the player should usually have a way to bypass them.

This protects the larger game from being dragged down by:

* repetition
* pacing friction
* player fatigue
* mastery mismatch, where the player understands the system but no longer wants to perform it manually

Treat skippability as a default expectation unless there is a strong reason not to.

Skipping should not necessarily mean "free success." Good skip options may include:

* auto-resolve based on character skill
* average or conservative outcome
* reduced reward ceiling
* lower variance result
* slower completion
* inability to achieve top-tier performance

This preserves the value of manual play without forcing repetition.

### Key insight

Manual play should usually offer:

* better ceiling
* more control
* more interesting outcomes

Skip should usually offer:

* convenience
* consistency
* lower friction

That creates a healthy tradeoff.

---

## Game Elements

A useful supporting concept is the distinction between **minigames** and **game elements**.

### Game element

A game element is a reusable component that can be part of a minigame, but is not necessarily a minigame by itself.

Examples:

* timing bar
* rhythm input
* grid placement
* ordering / sequencing
* obstacle placement
* path prediction
* risk/reward choice
* resource budget
* random payout table
* push-your-luck loop

These are building blocks.

### Minigame

A minigame is a composed structure made from one or more such elements into a self-contained decision loop.

### Key insight

This distinction is useful because it lets you:

* record raw mechanics without prematurely calling them games
* combine elements into richer designs later
* evaluate whether a concept is actually substantial enough

---

## Recommended Evaluation Questions

When recording a candidate, evaluate it with questions like:

* What is the player actually doing, step by step?
* Is this a full game loop, or just a mechanic?
* Where does player skill enter?
* Where does character skill enter?
* What is the result given back to the parent game?
* How does it scale?
* What prevents it from becoming trivial?
* What keeps it fictionally bounded?
* What parts are game elements, and what part is the actual minigame?
* How does it hold up after the tenth time?
* Does it justify its presence even if it is not strongly fun?
* What happens when the player wants to skip it?

---

## Design Philosophy

The goal is not to maximize complexity.
The goal is to create small embedded games that are:

* understandable
* replayable
* mechanically expressive
* stat-compatible
* capable of producing nuanced outcomes

A minigame should justify its existence by adding something a simple roll cannot:

* agency
* tension
* mastery
* texture
* memorable variation

A minigame does not need to be highly fun in isolation. It only needs to add enough value to the larger game to justify
the attention it demands. Because of that, and because repetition can turn even decent minigames stale, minigames should
generally be designed with a skip or auto-resolve path.

If it does not add those, it may be better as a normal roll or a lightweight mechanic.

---

## Defined Use Cases

## Use case 1: replace abstract skill checks

Instead of:

* roll skill, get result

Use:

* play a minigame
* use the minigame outcome as the skill result

## Use case 2: let player skill matter alongside character skill

The player is not merely watching a number resolve; they contribute directly.

## Use case 3: create texture between different activities

Different professions or situations can have distinct play patterns rather than sharing the same abstract roll
structure.

## Use case 4: create mastery space

Players can improve over time through learning, not only character advancement.

## Use case 5: express different kinds of competence

Some tasks are about:

* planning
* precision
* timing
* prioritization
* risk control

Minigames let those feel different.

---

## Non-Examples

These generally should **not** count as minigames on their own:

* a single timing click
* one power-bar stop
* one binary choice with no stateful consequence
* a pure random draw with cosmetic interaction
* a single input that only decorates an otherwise fixed outcome

They may still be:

* good mechanics
* good feedback devices
* useful game elements

They just are not full minigames by this definition.

---

## Minimal Working Definition

If you want the shortest practical definition:

> A minigame is a self-contained, multi-step gameplay challenge inside the larger game that lets player skill affect a
> result the parent game can use. It does not need to be highly fun in isolation, but it should justify its presence
> through context, and should generally be skippable.

And a corresponding companion definition:

> A game element is a mechanic or subsystem that can be part of a minigame, but is not necessarily a minigame by itself.

And a more design-oriented version:

> A minigame is a subordinate gameplay module: valuable not because it must stand alone as a great game, but because it
> adds agency, texture, and variation to the larger one.
