# DreamChamber Discord Upgrades (Navigation + Functionality)

This is a practical checklist for making a Discord server feel “obvious to use” (navigation) and “quiet but powerful” (functionality).

## 1) Turn on Community (recommended)

Community unlocks onboarding/guide features and stronger safety tooling.

- Server Settings → Community → Enable Community
- Choose a rules channel and a moderator-only updates channel

## 2) Navigation: Onboarding + Server Guide

### Onboarding (Channels & Roles)

Goal: members self-select what they need, and can change it later.

- Server Settings → Onboarding
  - Default Channels: keep this small (your essential “map” + a general channel)
  - Questions: use 1–3 questions that assign channels + roles

Example question:
- “What are you here to do?”
  - Build (assign: `#tasks`, `#dev-log`)
  - Create (assign: `#ideas`, `#assets`)
  - Collaborate (assign: `#pairing`, `#events`)

### Server Guide (Resources + To-Do)

Goal: reduce “where do I post this?” and “how does this server work?” questions.

- Server Settings → Onboarding → Server Guide
  - New member To-Do items (3–5)
    - Read rules
    - Pick channels/roles
    - Post first “Idea” in the Ideas forum
  - Resources: convert read-only channels into “Resource Pages” in the guide

Recommended resource pages:
- “How we work here”
- “Idea template”
- “Decision log”
- “Where files live” (links to your repos/drive/notion)

## 3) Information architecture: Forums + Threads

Use Forum channels as the “database” for work items.

Recommended forums:
- `Ideas` (each post = an idea; discussion lives in the post thread)
- `Tasks` (each post = a task; tags = status/priority/owner)
- `Decisions` (each post = a decision; link to the originating idea/task)

Forum settings to use:
- Require tags (forces structure)
- Guidelines (template at top)
- Hide after inactivity (keeps the list clean)

## 4) Functionality: AutoMod + Safety Setup

### AutoMod baseline

- Enable Spam Content filter
- Enable Mention Spam limit
- Add Custom Keyword rules for:
  - Invite spam patterns
  - Scam phrases you see in the wild
  - Optional: regex rules (harder to bypass)

Recommended actions:
- Block message
- Alert moderators to a private mod channel
- Timeout on repeat offenders

### Safety Setup baseline

- Set a sensible Verification Level (raise it temporarily during raids)
- Set Explicit Media Content Filter to Medium/High if you’re public
- Turn on Raid Protection alerts (if available for your server)

## 5) Add-ons (Discord Apps and/or Bots)

Only add what you actually need; too many bots makes the server feel “noisy”.

High-signal add-ons:
- Scheduling: Sesh (events, availability polls, reminders)
- Analytics: Statbot (activity stats; optional “activity-based roles”)
- Requests/support pipeline (optional): Ticket Tool / Helper.gg / self-hosted `discord-tickets/bot`

## 6) Suggested channel blueprint (keep it short)

- Start Here
  - `rules` (read-only)
  - `start-here` (read-only, points to Server Guide + Channels & Roles)
- Work
  - `ideas` (forum)
  - `tasks` (forum)
  - `decisions` (forum)
  - `dev-log`
- Studio
  - `assets`
  - `showcase`
- Comms
  - `general`
  - `announcements` (read-only)
  - `events` (if you schedule)
- Voice
  - `Focus`
  - `Pairing`

## Next step

If you tell me:
- your server type (private team vs public community),
- whether you want forum-based workflow,
- and your top 3 pain points,

…I can tailor the exact channel list, tags, onboarding questions, and AutoMod rules to fit.

